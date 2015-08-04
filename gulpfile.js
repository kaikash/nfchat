var gulp = require("gulp"),
		coffee = require("gulp-coffee");
gulp.task("default", function(){
	gulp.watch("./coffee/*.coffee", ["coffee"]);
	gulp.watch("./public/coffee/*.coffee", ["pcoffee"]);
});
gulp.task("coffee", function(){
	gulp.src("./coffee/*.coffee")
		.pipe(coffee())
		.pipe(gulp.dest("./"))
})
gulp.task("pcoffee", function(){
	gulp.src("./public/coffee/*.coffee")
		.pipe(coffee())
		.pipe(gulp.dest("./public/js"))
})