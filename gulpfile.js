var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var insert = require('gulp-insert');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var changed = require('gulp-changed');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var globby = require('globby');  
var csslint = require('gulp-csslint');
var htmlhint = require('gulp-htmlhint');

gulp.task('default', function(){
    // Default task
});

gulp.task('build', ['jslint', 'htmlhint', 'js','gs', 'html','css']);

gulp.task('watch', function(){ 
    var watcher = gulp.watch(['./src/**/*'], ['build']);
    watcher.on('change', function (event) {
        console.log('Event type: ' + event.type); // added, changed, or deleted
        console.log('Event path: ' + event.path);
    });
});




gulp.task('js', function() {
    globby('./src/js/*.js').then(function(entries) {
        var b = browserify({
            entries: entries,
            baseDir: './src/js',
            debug: true
        });

    return b.bundle()
        .pipe(source('js.html'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(insert.wrap('<script>', '</script>'))
        .pipe(gulp.dest('dist'));
    });    
})



gulp.task('gs', function() {
    // jshint and minify Code.gs
    return gulp.src('./src/gs/*.js')
        .pipe(changed('dist'))
        .pipe(concat('Code.gs'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
    
})




gulp.task('css', function() {
    // process css
    return gulp.src('./src/css/main.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(concat('css.html'))
        .pipe(insert.wrap('<style>', '</style>'))
        .pipe(gulp.dest('dist'));
        
});




gulp.task('html', function() {
    // process html  
    return gulp.src('./src/Index.html')
        .pipe(changed('dist'))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeCommentsFromCDATA: true,
            conservativeCollapse: true,
        }))
        .pipe(gulp.dest('dist'));
});




gulp.task('jslint', function() {
    return gulp.src(['./src/js/*.js', './src/gs/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
})



gulp.task('htmlhint', function() {
    return gulp.src('./src/Index.html')
        .pipe(htmlhint())
        .pipe(htmlhint.reporter());
})