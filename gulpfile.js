var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin'),
    cache = require('gulp-cached'),
    remember = require('gulp-remember');
var less = require('gulp-less');    
var minifycss = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
//var sass        = require("gulp-ruby-sass");
var browserSync = require('browser-sync');
var jshint = require('gulp-jshint');
var htmlInjector = require("bs-html-injector");
var gulpif = require('gulp-if');
// var httpreq = require('httpreq');
 
// httpreq.download('https://raw.githubusercontent.com/less/less.js/master/dist/less.min.js');

// gulp.task('php', function() {
//     php.server({ base: 'build', port: 8010, keepalive: true});
// });

function getPathRegex(path,extension,exclude_extension){
  var arr= path.split(":");
  var arr_ret = [];
  for (var i = 0; i < arr.length; i++){
    if (extension)
      arr_ret=arr_ret.concat([arr[i]+'/**/*.'+extension]);
    else
      arr_ret=arr_ret.concat([arr[i]+'/**/*']);
    if (exclude_extension)
      arr_ret=arr_ret.concat(['!'+arr[i]+'/**/*.'+exclude_extension]);
  }
  console.log(arr_ret);
  return arr_ret
}

var root = process.env.ROOT;
var url = process.env.URL;
var vport =  process.env.PORT;
var css_path = getPathRegex(process.env.CSS_PATH,'css','min.css');
var js_path = getPathRegex(process.env.JS_PATH,'js','min.js');
var less_path = getPathRegex(process.env.LESS_PATH,'less');
var sass_path = getPathRegex(process.env.SASS_PATH,'scss');
var phtml_path = getPathRegex(process.env.CODE_PATH,'phtml');
var code_path = getPathRegex(process.env.PHTML_PATH,'php').concat(getPathRegex(process.env.PHTML_PATH,'html'));
var image_path = getPathRegex(process.env.IMAGE_PATH);
var css_dest_path = process.env.CSS_DEST_PATH;
var js_dest_path = process.env.JS_DEST_PATH;
var version_file =process.env.VERSION_FILE;
var gen_files = ( process.env.GENERATE === 'yes');

// var url = "http://www.vipclubprive.com";
// var css_path = getPathRegex("/tmp/www:/tmp/2",'css','min.css');
// var js_path = getPathRegex("/tmp/www",'js','min.js');
// var less_path = getPathRegex("/tmp/www",'less');
// var sass_path = getPathRegex("/tmp/www",'scss');
// var phtml_path = getPathRegex("/tmp/www",'phtml');
// var code_path = getPathRegex("/tmp/www",'php').concat(getPathRegex("/tmp/www",'html'));
// var image_path = getPathRegex("/tmp/www");
// var css_dest_path = "/tmp/www";
// var js_dest_path = "/tmp/www";
// var version_file = "/tmp/www/version";

console.log(code_path);

gulp.task('browser-sync', function() {
    // browserSync.use(htmlInjector, {
    //     files: ["/app/node_modules/less/dist/less.min.js"]
    // });
    browserSync.init({
        proxy: url,
        port: vport,
        open: false,
        notify: true,
        xip: false,
        minify: false,
        weinre: {
          port: 8080
        }         
    });
});
// gulp.task('browser-sync', function() {
//   browserSync({
//     server: {
//        baseDir: "/tmp/www"
//     }
//   });
// });


function bs_reload() {
  //console.log("reload");
  return browserSync.reload();
}
function bs_stream(glob) {
  //console.log("stream");
  return function () { gulp.src(glob)
   .pipe(browserSync.stream());
 };
}

gulp.task('reload', function(){
  bs_reload();
});

gulp.task('images', function(){
  gulp.src(image_path)
    .pipe(cache('images')) 
    .pipe(gulpif(gen_files,imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(remember('images')) 
    .pipe(gulp.dest('dist/images/'));
});

gulp.task('sass', function(){
    //return sass(sass_path,{sourcemap: true})
    //.on('error', function (err) {
    //        console.error('Error!', err.message);
   //     })
    gulp.src(sass_path)
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }}))
    .pipe(cache('sass'))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('dist/styles/'))
    .pipe(rename({suffix: '.min'}))

    .pipe(minifycss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(css_dest_path))
    .pipe(browserSync.stream({match: css_dest_path+'/**/*.css'}))
    //.pipe(browserSync.reload({stream:true}))
});

gulp.task('less', function(){
  gulp.src(less_path)   
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(cache('less'))    
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest(css_dest_path))
    //.pipe(base64({ extensions:['svg'] }))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(css_dest_path))
    .pipe(browserSync.stream({match: css_dest_path+'/**/*.css'}))
    //.pipe(browserSync.reload({stream:true}))
});

gulp.task('css', function() {
      // grab css files and send them into browserSync.stream
      // this injects the css into the page
      gulp.src(css_path)
        .pipe(plumber({
          errorHandler: function (error) {
            console.log(error.message);
            this.emit('end');
        }}))      
        .pipe(cache('css'))   
        .pipe(gulpif(gen_files,sourcemaps.init()))    
        .pipe(gulpif(gen_files,rename({suffix: '.min'})))
        .pipe(gulpif(gen_files,minifycss()))
        .pipe(gulpif(gen_files,sourcemaps.write()))
        .pipe(gulpif(gen_files,gulp.dest(css_dest_path)))      
        .pipe(browserSync.stream({match: css_dest_path+'/**/*.css'}))
});

gulp.task('scripts', function(){
  gulp.src(js_path)

    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(cache('js')) 
    .pipe(gulpif(gen_files,sourcemaps.init()))     
    .pipe(jshint())
    .pipe(jshint.reporter('gulp-jshint-html-reporter', {
      filename: root + '/jshint.html',
      createMissingFolders : true
      }))
    .pipe(gulp.dest(js_dest_path))
    .pipe(gulpif(gen_files,rename({suffix: '.min'})))  
    .pipe(gulpif(gen_files,uglify()))
    .pipe(gulpif(gen_files,sourcemaps.write()))
    .pipe(gulpif(gen_files,gulp.dest(js_dest_path)))
    .pipe(browserSync.stream({match: js_dest_path+'/**/*.js'}))
    //.pipe(browserSync.reload({stream:true}))
});

gulp.task('compile_css',function(){
  gulp.series('less','css');
    
});

gulp.task('compile',function(){
  console.log("compile");
  if (process.env.IMAGE_PATH != "")
    gulp.parallel('scripts','compile_css','images');
  else
    gulp.parallel('scripts','compile_css','images');

});
gulp.task('default', ['browser-sync'], function(){
  //gulp.watch(version_file, ['compile']);
  gulp.watch(sass_path, ['sass']);
  gulp.watch(less_path, ['less']);
  gulp.watch(js_path, ['scripts']);
  gulp.watch(css_path,['css']);
  gulp.watch(code_path, bs_reload);
  //gulp.watch('/app/**/*.php').on('change', ['bs-reload']);
  gulp.watch(phtml_path, bs_reload);
  // if (process.env.IMAGE_PATH != "")
  //   gulp.watch(image_path,['images']);
});
