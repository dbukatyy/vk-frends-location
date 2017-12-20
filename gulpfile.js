var gulp = require('gulp'),
    prefixer = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    browserSync = require('browser-sync'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    notify = require('gulp-notify'),
    spritesmith = require('gulp.spritesmith'),
    svgSprite = require('gulp-svg-sprites'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    uncss = require('gulp-uncss'),
    pug = require('gulp-pug'),
    reload = browserSync.reload,
    babel = require('gulp-babel'),
    config = {

        server: {
            baseDir: "./build"
        },

        tunnel: false,
        host: 'localhost',
        port: 8080,
    };

var path = {

    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        sprite: 'src/img/sprite'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        pug: 'src/pug/**/*.pug',
        js: 'src/js/*.js',
        jsLib: 'src/js/libs/*.js',
        style: 'src/less/style.less',
        css: 'src/css/**/*.css',
        img: 'src/img/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*',
        sprite: 'src/img/png/*.*',
        svg: 'src/img/svg/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/less/**/*.less',
        css: 'src/css/**/*.css',
        img: 'src/img/*.*',
        fonts: 'src/fonts/**/*.*',
        sprite: 'src/img/png/*.*',
        svg: 'src/img/svg/*.*'
    },
    clean: './build'
};


// remove dir build
gulp.task('clean', function () {
    return gulp.src(path.clean, {read: false})
        .pipe(clean());
});


// server connect
gulp.task('webserver', function () {
    browserSync(config);
});

// sprite
gulp.task('sprite', function () {
  gulp.src(path.src.sprite)
      .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css',
        imgPath: '../img/sprite.png',
        padding: 20
      }))
      .pipe(gulp.dest(path.build.sprite));
});

// svg sprite
gulp.task('spritesvg', function () {
    return gulp.src(path.src.svg)
        // .pipe(cheerio({
        //     run: function ($) {
        //         $('[fill]').removeAttr('fill');
        //         $('[stroke]').removeAttr('stroke');
        //         $('[style]').removeAttr('style');
        //         $('[width]').removeAttr('width');
        //         $('[height]').removeAttr('height');
        //     },
        //     parserOptions: {xmlMode: true}
        // }))
        // .pipe(replace('&gt;', '>'))
        .pipe(svgSprite(
            //     {
            //     mode: "symbols",
            //     preview: false,
            //     selector: "icon-%f",
            //     svg: {
            //         symbols: 'sprite.svg'
            //     }
            // }
        ))
        .pipe(gulp.dest(path.build.sprite));
});

// fonts
gulp.task('fonts', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


// html
gulp.task('pug', function buildHTML() {
  return gulp.src(path.src.pug)
  .pipe(pug({
    pretty: true 
  }))
  .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
  .pipe(notify('html save ok'))
  .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('html', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(notify('html save ok'))
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});


// js
gulp.task('js', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(babel({
            presets: ['es2015']
        }))
        // .pipe(uglify()) //Сожмем наш js
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(notify('js save ok'))
        .pipe(reload({stream: true})); //И перезагрузим сервер
});


// jsLib 
gulp.task('jsLib', function () {
    gulp.src(path.src.jsLib) //Найдем все файлы библиотек
        .pipe(concat('vendor.js')) //объединим в один файл
        .pipe(uglify()) //Сожмем наш js
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(notify('jsLib save ok'))
        .pipe(reload({stream: true})); //И перезагрузим сервер
});


// css
gulp.task('css', function () {
    gulp.src(path.src.css) //Выберем 
        .pipe(concat('vendor.css'))//Объединим в один файл 
        // .pipe(uncss({
        //     html: [path.watch.html]
        // }))
        .pipe(cssmin()) //Сожмем
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(notify('css save ok'))
        .pipe(reload({stream: true}));
});


// style
gulp.task('style', function () {
    gulp.src(path.src.style) //Выберем наш less
        .pipe(less()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        // .pipe(uncss({
        //     html: [path.watch.html]
        // }))
        // .pipe(cssmin()) //Сожмем
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(notify('less save ok'))
        .pipe(reload({stream: true}));
});


// image
gulp.task('image', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        // .pipe(notify('img save ok'))
        .pipe(reload({stream: true}));
});

// build
gulp.task('build', [
    'html',
    'js',
    'fonts',
    'style',
    'image',
    'css',
    'jsLib',
    'sprite',
    'spritesvg',
    'pug'
]);


// watch 
gulp.task("watch", function() {
    gulp.watch(path.watch.html, ['html']);
    gulp.watch(path.watch.js, ['js']);
    gulp.watch(path.watch.style, ['style']);
    gulp.watch(path.watch.css, ['css']);
    gulp.watch(path.watch.img, ['image']);
    gulp.watch(path.watch.fonts, ['fonts']);
    gulp.watch(path.watch.sprite, ['sprite']);
    gulp.watch(path.watch.svg, ['spritesvg']);
    gulp.watch(path.src.jsLib, ['jsLib']);
    gulp.watch(path.src.pug, ['pug']);
});


// default
gulp.task('default', ['build', 'webserver', 'watch']);