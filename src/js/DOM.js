/**
 * This module provides functions that control the
 * showing/hiding of DOM elements.
 */

module.exports = {
    /**
    * Updates "Select Folder" fields with selected folder info
    */
    folderIsSelected: function (selectedFolder) {
        // update display
        $(".getFolderErrors").text("");
        $(".folderName").text(selectedFolder.srcName);
        
        $(".folderSelect").hide();
        $(".folderLookup").hide();
        $(".selectedFolderInfo").show();
    },
    
    
    /**
    * Function to alert user that folder is being identified
    * Hides folder
    */
    onFolderLookup: function () {
        $(".folderLookup").show();
        $(".folderSelect").hide();
    }, 
    
    
    
    
    /**
    * Called when either form validates.
    * Updates UI to indicate that the app is initializing.
    */
    onValid: function () {
        $(".description").hide("blind");
        $("#errors").html("");
        $(".selectOtherFolder").hide("blind");
        $("#resume-button").attr("disabled", "disabled");
        $("#new-transfer-button").attr("disabled", "disabled");
        
        $("#transferFolderButton").button('loading');
        $("#resumeFolderSubmit").button('loading');
        $("#folder").prop('disabled', true);
        $("#newOwner").prop('disabled', true);
        
        $("#status").show("blind");
    },
    
    
    
    /**
    * Resets form to default state
    */
    resetForm: function () {
        $(".folderSelect").show();
        $(".selectedFolderInfo").hide();
        $(".getFolderErrors").hide();
    }
};

