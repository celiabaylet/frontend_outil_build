(function() {
const htmlDOM = document.querySelector('html');
const themeTogglerDOM = document.querySelector("#theme-toggler");

themeTogglerDOM.addEventListener('click', function() {
	htmlDOM.classList.toggle('dark');
});
	
})();