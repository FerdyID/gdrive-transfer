/**
 * This module provides functions that add event listeners
 * to all parts of the application.
 * 
 * Individual functions are commented to provide context for 
 * their usage.
 */

var DOM = require('./DOM');
var picker = require('./picker');
var templates = require('./templates.js');
var icons = require('./icons');
var parseId = require('./parseId');
var textboxHandlers = require('./textbox-handlers');


module.exports = {
    /**
     * Sets bindings for navigation buttons
     */
    'addNavListeners': function() {
        
        $('#resume-button').click(function() {
            $("#put-forms-here").html(templates.resume.render({}, icons));
            $(".btn--nav").removeClass("active");
            $(this).addClass("active");
            module.exports.addResumeFormListeners();
        }); 

        $('#start-button').click(function(e) {
            $("#put-forms-here").html(templates.start.render({}, icons));
            $(".btn--nav").removeClass("active");
            $(this).addClass("active");
            module.exports.addStartFormListeners();
        });

        $('#stop-button').click(function(e) {
            $("#put-forms-here").html(templates.pause.render({'confirmed': false}));
            $(".btn--nav").removeClass("active");
            $(this).addClass("active");

            $('#stop-confirm-button').click(function() {
                $("#put-forms-here").html(templates.pause.render({'confirmed': true}));
                google.script.run.setStopFlag();
            });
        });

        $('#faq-button').click(function() {
            $("#put-forms-here").html(templates.faq.render({}, icons));
            $(".btn--nav").removeClass("active");
            $(this).addClass("active");
        });
    },



    /**
     * Set bindings for selectFolder and selectOtherFolder buttons.
     * Used in both addResumeformListeners and addStartFormListeners
     */
    'addSelectButtonListeners': function() {
        $(".selectOtherFolder").click(function() {
            DOM.resetForm();
        });

        // Show Google Picker when select Folder buttons are selected
        $(".selectFolderButton").click(function() {
            picker.showPicker();
        });
    },



    /**
     * Set bindings for input elements in the Resume view
     */
    'addResumeFormListeners': function() {
        module.exports.addSelectButtonListeners();
        
        var resumeTextbox = document.getElementById("resumeTextbox");
        resumeTextbox.addEventListener('mouseup', textboxHandlers.handleMouse, false);
        resumeTextbox.addEventListener('keyup', textboxHandlers.getFileData, false);
        

        /**
         * Execute when resuming folder transfer.
         *
         * @param {Object} event
         */
        $("#resumeForm").submit(function( event ) {
            
            var errormsg;

            // validate
            if (!picker.folder.srcId) {
                errormsg = "<div class='alert alert-danger' role='alert'>Please select a folder</div>";
                $("#errors").html(errormsg);

            } else {
                // Valid!
                DOM.onValid();

                picker.folder.resuming = true;

                // count number of triggers
                google.script.run
                    .withSuccessHandler(function(number) {
                        // prompt user to wait or delete existing triggers
                        if (number > 9) {
                            $("#too-many-triggers").show('blind');
                            $("#status").hide("blind");
                        } else {

                            // if not too many triggers, initialize script
                            google.script.run
                                .withSuccessHandler(success)
                                .withFailureHandler(showError)
                                .resume(picker.folder);
                        }
                    })
                    .withFailureHandler(function(err) {
                        $("#errors").append(err);
                    })
                    .getTriggersQuantity();
            }
            event.preventDefault();
        });
    },



    /**
     * set bindings for input elements in the Start view
     */
    'addStartFormListeners': function() {
        var folderTextbox = document.getElementById("folderTextbox");
        folderTextbox.addEventListener('mouseup', textboxHandlers.handleMouse, false);
        folderTextbox.addEventListener('keyup', textboxHandlers.getFileData, false);
        module.exports.addSelectButtonListeners();


        /**
         * Execute when beginning new folder transfer
         *
         * Bind form submission action.
         * Disable form elements,
         * Hide description text for app,
         * Show status spinner,
         * run initialization method.
         * 
         * @param {Object} event 
         */
        $("#folderForm").submit(function( event ) { 
            
            var errormsg; 
            
            // validate
            if (!picker.folder.srcId) {
                errormsg = "<div class='alert alert-danger' role='alert'>Please select a folder</div>";
                $("#errors").html(errormsg);
                
            } else if ( $("#newOwner").val() === "" ) {
                errormsg = "<div class='alert alert-danger' role='alert'>Please enter a new owner email address</div>";
                $("#errors").html(errormsg);
                
            } else {
                // Valid!
                DOM.onValid();
                
                // Get values from form and selected folder to initialize transfer        
                picker.folder.newOwner = $("#newOwner").val();

                // count number of triggers
                google.script.run
                    .withSuccessHandler(function(number) {
                        // prompt user to wait or delete existing triggers
                        if (number > 9) {
                            $("#too-many-triggers").show('blind');
                            $("#status").hide("blind");
                        } else {

                            // if not too many triggers, initialize script
                            google.script.run
                                .withSuccessHandler(success)
                                .withFailureHandler(showError)
                                .initialize(picker.folder);
                        }
                    })
                    .withFailureHandler(function(err) {
                        $("#errors").append(err);
                    })
                    .getTriggersQuantity();
            }
            event.preventDefault();
            
        });
    },



    /**
     * 
     */
    'addDeleteTriggerButtonListeners': function() {
        $('#delete-existing-triggers').click(function() {
            $("#status").show("blind");
            $("#too-many-triggers").hide();

            google.script.run
                .withSuccessHandler(function() {

                    if (picker.folder.resuming) {
                        google.script.run
                            .withSuccessHandler(success)
                            .withFailureHandler(showError)
                            .resume(picker.folder);
                    } else {
                        google.script.run
                            .withSuccessHandler(success)
                            .withFailureHandler(showError)
                            .initialize(picker.folder);
                    }

                })
                .withFailureHandler(function(err) {
                    $("#errors").append(err);
                })
                .deleteAllTriggers();
        });
    }


}





/**
 * Hide 'status' indicator, and show success message.
 * Include links to logger spreadsheet and destination folder
 * so user can monitor progress of the transfer.
 * Alert user that they can safely close the window now.
 * 
 * @param {Object} results contains id string for logger spreadsheet and destination folder
 */
function success(results) {
    
    $("#status").hide("blind");
    
    // link to spreadsheet and  dest Folder
    var transferLogLink = "<a href='https://docs.google.com/spreadsheets/d/" + results.spreadsheetId +"' target='_blank'>transfer log</a>";
    $("#transfer-log-link").html(transferLogLink);
    
    // var destFolderLink = "<a href='https://drive.google.com/drive/u/0/folders/" + results.destId + "' target='_blank'>here</a>";
    // $("#dest-folder-link").html(destFolderLink);
    
    // alert that they can close window now
    $("#complete").show("blind");
    $("#please-review").show("blind");
    
    
    
    google.script.run.transfer();
    
    
}



/**
 * Build an 'alert' div that contains
 * error message output from Google Apps Script
 * and suggestions for fixing the error
 * 
 * @param {string} msg error message produced by Google Apps Script from initialize() call
 */ 
function showError(msg) {
    $("#status").hide();
    
    var errormsg = "<div class='alert alert-danger' role='alert'><b>Error:</b> There was an error initializing the transfer folder request.<br />";
    errormsg += "<b>Error message:</b> " + msg + ".<br>";
    errormsg += "Please try again. Make sure you have correct permissions to transfer this folder, and make sure you are using Google Chrome or Chromium when using this app.</div>";
    $("#errors").append(errormsg);
}