var gulp = require("gulp"),
		coffee = require("gulp-coffee");
gulp.task("default", function(){
	gulp.watch("./coffee/*.coffee", ["coffee"]);
});
gulp.task("coffee", function(){
	gulp.src("./coffee/*.coffee")
		.pipe(coffee())
		.pipe(gulp.dest("./"))
})