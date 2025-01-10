/*
TODO:
- make sure absolute position for contestant images and vs image is not absolutely fucked by different image sizes
(set height for absolute positioned container div and vertically center image inside)
- just make it look nicer in general AFDSGFHDGF
- do error checks to make sure urls are valid, uploaded files are actually images, etc
*/

let contestantArray = [];
let excludedMatchups = [];
let isRandomized = false;

//constructor for contestant
function Contestant(name, image, id) {
	this.id = id;
	this.name = name;
	this.image = image;
	this.randNum = 0;
}

//runs when you input # contestants
function inputNumber() {

	let numContestants = document.getElementById("numContestants").value;

	//show error if not a number
	if (isNaN(numContestants) || !numContestants){
		document.getElementById("error").innerHTML = "Must be a number.";
	}
	//show error if 0 or less
	else if (numContestants <= 0) {
		document.getElementById("error").innerHTML = "Must be greater than zero."
	}
	//show error if not even number
	else if ((numContestants % 2) !== 0){
		document.getElementById("error").innerHTML = "Must be an even number.";
	}
	//error message is empty otherwise and makes boxes to fill in the info
	else {
		makeInfoBoxes(numContestants);
	}
}

function makeLandingPage() {
	let main = clearMain();

	//the info form to input username and img url
	let form = document.createElement("form");
	form.id = "submitForm";
	main.appendChild(form);

	let enterTeamsText = document.createElement("div");
	enterTeamsText.innerHTML = "Enter the number of teams:";
	form.appendChild(enterTeamsText);

	let numInput = document.createElement("input");
	numInput.type = "text";
	numInput.id = "numContestants";
	form.appendChild(numInput);

	let submitButton = createButton("submitNum", "Submit", inputNumber);
	form.appendChild(submitButton);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));

	form.appendChild(document.createTextNode("OR"));
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));

	//wrapper container for all the file shit
	let fileContainer = document.createElement("div");
	fileContainer.setAttribute("class", "file-container");
	form.appendChild(fileContainer);

	let fromFileText = document.createElement("div");
	fromFileText.innerHTML = "Upload contestant images from file:";
	fileContainer.appendChild(fromFileText);

	//input element for uploading files
	let fileButton = document.createElement("input");
	fileButton.type = "file";
	fileButton.id = "files";
	fileButton.setAttribute("class", "file");
	fileButton.setAttribute("multiple", "");
	fileContainer.appendChild(fileButton);

	let submitFilesButton = createButton("submitFile", "Submit", () => {
		//gets files that the user uploaded
		const fileList = document.getElementById("files").files;
		if (!fileList || fileList.length <= 0) {
			document.getElementById("error").innerHTML = "Must upload at least one file";
			return;
		}
		if (fileList.length %2 !== 0) {
			document.getElementById("error").innerHTML = "Must have an even number of contestants";
			return;
		}

		//generates next page (list of contestants)
		makeInfoBoxes(fileList.length);

		//populate list of contestants with file information 
		for (let i = 0; i < fileList.length; i++) {
			let contestantName = fileList[i].name;
			//uses regex to get rid of the file extension
			contestantName = contestantName.replace(/^(.+)\.[a-zA-Z]+$/, "$1");
			document.getElementById("username" + i).value = contestantName;
			document.getElementById("img" + i).value = URL.createObjectURL(fileList[i]);
		}
	});
	fileContainer.appendChild(submitFilesButton);

	main.appendChild(document.createElement("br"));
	let colorButton = createButton("test", "Customize", makeCustomColorsForm);	
	main.appendChild(colorButton);
}

//makes text boxes to input usernames and img urls
function makeInfoBoxes(num) {
	const nums = [];
	for (let i = 1; i <= 66; i++) {
		nums.push({
			num: i,
			val: Math.random()
		});
	}
	nums.sort((num1, num2) => {
		return num1.val > num2.val ? -1 : (num1.val < num2.val ? 1 : 0);
	});

	let main = clearMain();

	//the info form to input username and img url
	let form = document.createElement("form");
	form.id = "infoForm";
	main.appendChild(form);

	for (let i=0; i < num; i++){

		form.appendChild(document.createTextNode((i+1) + ". ")); //adds #s 
		//create username input box
		let userInput = document.createElement("input");
		userInput.title = "Text that displays below the image. \x0ABy default, it will display the filename if images were uploaded.";
		userInput.type = "text";
		userInput.id = "username" + i;
		userInput.setAttribute("class", "userInput");
		userInput.placeholder = "Username(s)";
		form.appendChild(userInput);
		form.appendChild(document.createTextNode(" "));	//adds a space

		//create img url input box
		let imgInput = document.createElement("input");
		imgInput.title = "Do NOT modify this if you uploaded files. \x0AOtherwise, must be a valid image URL."
		imgInput.type = "text";
		imgInput.id = "img" + i;
		imgInput.placeholder = "Image URL";
		form.appendChild(imgInput);

		form.appendChild(document.createElement("br"));	//line break
	}

	form.appendChild(document.createElement("br"));

	function submit() {
		//check if empty before calling next function
		for (let i=0; i < num; i++){
			let name = document.getElementById("username" + i).value;
			let img = document.getElementById("img" + i).value;

			//if name or image is empty then display error
			if (!name || !img){
				document.getElementById("error").innerHTML = "Please fill in everything first!";
			 	return "error";
			}
			//if all boxes are filled in then continue
			if (i === num-1) {
				//create new contestant array
				contestantArray = new Array(num);
				//create contestants
				for (let i=0; i < num; i++){	
					let name = document.getElementById("username" + i).value;
					let img = document.getElementById("img" + i).value;

					//create contestant object and add to the array
					let contestant = new Contestant(name || ("null" + i), img || "images/logo.png", i);
					contestantArray[i] = contestant;
				}
			}
		}
	};

	//create submit button with function on click
	let submitButton = createButton("submitInfo", "Default Generator", () =>{
		if (submit() == "error") return;
		createContestants(num);
	});

	//button to exclude matchups
	let optionsButton = createButton("optionsButton", "Customized Generator", () => {
		if (submit() == "error") return;
		showOptions(contestantArray);
	});
	form.appendChild(optionsButton);


	form.appendChild(submitButton);
	form.appendChild(document.createElement("br"));
}

//creates array of contestants using info from textboxes
function createContestants(num) {
	
	let main = clearMain();

	//create contestants, reading from global contestant array
	for (let i=0; i < contestantArray.length; i++){	

		//add image and name
		displayImg = document.createElement("img");
		displayImg.src = contestantArray[i].image;
		displayImg.setAttribute("class", "image");

	}

	//button to randomize
	let randButton = createButton("randButton", "Generate Matchups", () => {
		randomize(contestantArray);
	});
	main.appendChild(document.createElement("br"));
	main.appendChild(randButton);
}

function contestantComparator(contestant1, contestant2) {
	return contestant1.randNum > contestant2.randNum ? -1 : (contestant1.randNum < contestant2.randNum ? 1 : 0);
}

function showOptions(contestantArray) {
	let main = clearMain();
	let optionsContainer = document.createElement("div");
	optionsContainer.setAttribute("class", "optionsContainer");

	//button to randomize
	let randButton = createButton("randButton", "Exit (Generate WITHOUT custom options)", () => {
		isRandomized = false;
		createContestants(contestantArray);
	});

	const excludeTitle = document.createElement("h2");
	excludeTitle.innerText = "Exclude matchups";
	const excludeDesc = document.createElement("div");
	excludeDesc.innerText = "Set matchups to be excluded and hit \"Generate with matchup(s) excluded\" BEFORE you leave this form. \x0AThe randomizer will attempt to create a valid set of matchups given the constraints. \x0AIf it fails, an error will be shown and you may try again. \x0AIf it succeeds, hit \"Submit\" to proceed to displaying matchups.\x0A\x0A";
	excludeDesc.setAttribute("class", "desc");
	excludeSubtitle = document.createElement("div");
	excludeSubtitle.innerText = "Matchups to be excluded:";
	excludeSubtitle.setAttribute("class", "desc");

	const matchupsContainer = document.createElement("div");
	matchupsContainer.id = "excludedMatchupsContainer";

	const newMatchupBtn = createButton("newExcludedMatchupBtn", "+ Add matchup", () => {
		matchupsContainer.appendChild(excludedMatchup(matchupsContainer));
	});
	const newMatchupBtnContainer = document.createElement("div");
	newMatchupBtnContainer.appendChild(newMatchupBtn);

	let nextButton = createButton("nextButton", "Submit", () => {
		createContestants(contestantArray);
	});
	const nextBtnContainer = document.createElement("div");
	nextBtnContainer.appendChild(nextButton);
	//disable submit button until a valid roster is generated
	nextButton.setAttribute("disabled", true);
	nextButton.style.setProperty("cursor", "not-allowed");

	const excludedErrorMsg = document.createElement("div");
	excludedErrorMsg.setAttribute("class", "errorMsg");

	let isRandomizing = false;
	let excludeButton = createButton("excludeButton", "Generate with matchup(s) excluded", () => {
		let matchups = matchupsContainer.getElementsByClassName("excludedMatchup");
		if (matchups.length < 1) {
			document.getElementById("error").innerText = "No excluded matchups present!";
			return;
		}
		excludedMatchups = new Array(matchups.length);
		for (let i = 0; i < matchups.length; i++) {
			excludedMatchups[i] = new Array(2);
			excludedMatchups[i][0] = matchups[i].getElementsByClassName("leftContestant")[0].value;
			excludedMatchups[i][1] = matchups[i].getElementsByClassName("rightContestant")[0].value;
		}

		isRandomizing = true;
		let iteration = 0;
		while (iteration < 100) {
			excludedErrorMsg.innerText = "Generating...";
			randomizeContestants();
			let isValid = true;
			for (let i = 0; i < contestantArray.length; i += 2) {
				for (let j = 0; j < excludedMatchups.length; j++) {
					const id1 = contestantArray[i].id.toString();
					const id2 = contestantArray[i+1].id.toString();
					if ((excludedMatchups[j][0] === id1 && excludedMatchups[j][1] === id2) ||
						(excludedMatchups[j][1] === id1 && excludedMatchups[j][0] === id2)) {
						isValid = false;
						break;
					}
				}
				if (!isValid) break;
			}
			if (isValid) {
				isRandomizing = false;
				isRandomized = true;
				nextButton.removeAttribute("disabled");
				nextButton.style.setProperty("cursor", "auto");
				excludedErrorMsg.innerText = "Success! Matchups generated with exclusions";
				return;
			}
			iteration++;
			if (iteration === 100) {
				excludedErrorMsg.innerText = "No valid matchups generated after 100 iterations. Try again?";
				nextButton.setAttribute("disabled", true);
				nextButton.style.setProperty("cursor", "not-allowed");
				break;
			}
		}
	});
	const excludeBtnContainer = document.createElement("div");
	excludeBtnContainer.appendChild(excludeButton);

	optionsContainer.appendChild(randButton);
	optionsContainer.appendChild(document.createElement("br"));
	optionsContainer.appendChild(document.createElement("br"));
	optionsContainer.appendChild(excludeTitle);
	optionsContainer.appendChild(excludeDesc);
	optionsContainer.appendChild(excludeSubtitle);
	optionsContainer.appendChild(matchupsContainer);
	optionsContainer.appendChild(newMatchupBtnContainer);
	optionsContainer.appendChild(document.createElement("br"));
	optionsContainer.appendChild(excludeBtnContainer);
	optionsContainer.appendChild(excludedErrorMsg);
	optionsContainer.appendChild(nextBtnContainer);
	main.appendChild(optionsContainer);
}

function excludedMatchup(parent) {
	let excludedMatchup = document.createElement("div");
	excludedMatchup.setAttribute("class", "excludedMatchup");
	let contestantLeft = document.createElement("select");
	contestantLeft.setAttribute("class", "leftContestant");
	for (let i = 0; i < contestantArray.length; i++) {
		let option = document.createElement("option");
		option.setAttribute("value", contestantArray[i].id);
		option.innerText = contestantArray[i].name;
		contestantLeft.appendChild(option);
	}
	let contestantRight = document.createElement("select");
	contestantRight.setAttribute("class", "rightContestant");
	for (let i = 0; i < contestantArray.length; i++) {
		let option = document.createElement("option");
		option.setAttribute("value", contestantArray[i].id);
		option.innerText = contestantArray[i].name;
		contestantRight.appendChild(option);
	}
	const vs = document.createElement("span");
	vs.innerText = " vs. "
	const removeBtn = createButton("removeMatchup", "Remove", () => {
		parent.removeChild(excludedMatchup);
	});
	excludedMatchup.appendChild(contestantLeft);
	excludedMatchup.appendChild(vs);
	excludedMatchup.appendChild(contestantRight);
	excludedMatchup.appendChild(removeBtn);
	return excludedMatchup;
}

//generates random numbers for each contestant and displays them
function randomize(contestantArray) {
	//clear images
	let main = clearMain();

	//create button container
	let buttonContainer = document.createElement("div");
	buttonContainer.setAttribute("class", "button-container");
	main.appendChild(buttonContainer);
	//button to randomize, put again for testing purposes so we can repeatedly randomize
	/*let randButton = createButton("randButton", "Generate Matchups", () => {
	 	randomize(contestantArray);
	});
	buttonContainer.appendChild(randButton);*/

	let currentMatchup = 0;
	let len = contestantArray.length;

	let nextMatchButton = createButton("nextMatchButton", "Next Matchup", () => {
		if (currentMatchup >= len - 2) {
			let finalMatchupsButton = createButton("finalMatchupsButton", "Show Final Matchups", () => {
				displayFinalMatchups(contestantArray);
			});

			buttonContainer.removeChild(nextMatchButton);
			buttonContainer.appendChild(finalMatchupsButton);

		}
		if (currentMatchup < len) {
			showMatchup(contestantArray, currentMatchup);
			currentMatchup += 2;
		}
	});
	buttonContainer.appendChild(nextMatchButton);

	if (!isRandomized) {
		randomizeContestants();
	}

	let thisMatchup = matchupContainer();
	main.appendChild(thisMatchup);

	//display first matchup
	showMatchup(contestantArray, currentMatchup);
	currentMatchup += 2;


	//center vs vertically
	let imgHeight = thisMatchup.getElementsByClassName("contestant")[0].getElementsByTagName("IMG")[0].offsetHeight;
	if (imgHeight === 0) {
		imgHeight = 480;
	}
	thisMatchup.getElementsByClassName("vs")[0].style["top"] = (imgHeight/2) + "px";

	//resize matchup container
	thisMatchup.style["height"] = imgHeight + "px";
}

function randomizeContestants() {
	//assign random number to each contestant
	for (let i=0; i < contestantArray.length; i++) {
		contestantArray[i].randNum = Math.random();
	}

	//sorts the array from least to greatest
	contestantArray.sort(contestantComparator);
	return contestantArray;
}

function displayContestant(contestant, element, animClass) {
	if(element.children.length > 0) {
		for (let child of element.children) {
			if (child && !child.className.includes("disappear")) {
				child.setAttribute("class", "contestant disappear");
			}
		}
		setTimeout(() => {
			for (let child of element.children) {
				if (child && child.className.includes("disappear")) {
					element.removeChild(child);
				}
			}
		}, 5000)
	}
	const contestantEl = document.createElement("div");
	contestantEl.setAttribute("class", "contestant");
	const img = document.createElement("img");
	img.src = contestant.image;
	img.setAttribute("class", "image");
	contestantEl.appendChild(img);
	contestantEl.appendChild(document.createElement("br"));	//line break
	const name = document.createTextNode(contestant.name);
	contestantEl.appendChild(name);
	contestantEl.setAttribute("class", "contestant " + animClass);
	element.appendChild(contestantEl);
}

function matchupContainer() {
	let match = document.createElement("div");
	match.setAttribute("class", "matchDiv");

	//create container for contestant on the left
	let contestant1 = document.createElement("div");
	contestant1.setAttribute("class", "contestant-container leftContestant");
	match.appendChild(contestant1);

	//vs in between
	match.appendChild(vsDiv());

	//create container for contestant on the right
	let contestant2 = document.createElement("div");
	contestant2.setAttribute("class", "contestant-container rightContestant");
	match.appendChild(contestant2);

	return match;
}

function vsDiv() {
	let vsContainerDiv = document.createElement("div");
	vsContainerDiv.setAttribute("class", "vs-container");
	let vsDiv = document.createElement("div");
	vsDiv.setAttribute("class", "vs");
	vsContainerDiv.appendChild(vsDiv);
	let vsImg = document.createElement("img");
	vsImg.setAttribute("class", "vsImg");					
	vsDiv.appendChild(vsImg);
	return vsContainerDiv;
}

function displayFinalMatchups(contestantArray) {
	//clear content
	let main = clearMain();

	//create matchup elements
	for (let i = 0; i < contestantArray.length; i+=2) {
		setTimeout(() => {
			const thisMatchup = matchupContainer();
			main.appendChild(thisMatchup);
			const thisLeftMatchup = thisMatchup.getElementsByClassName("leftContestant")[0];
			const thisRightMatchup = thisMatchup.getElementsByClassName("rightContestant")[0];
			displayContestant(contestantArray[i], thisLeftMatchup, "contestant-left");
			displayContestant(contestantArray[i+1], thisRightMatchup, "contestant-left");

			let imgHeight = thisMatchup.getElementsByClassName("contestant")[0].getElementsByTagName("IMG")[0].offsetHeight;
			if (imgHeight === 0) {
				imgHeight = 480;
			}
			thisMatchup.style["height"] = imgHeight + "px";

			//center vs vertically
			thisMatchup.getElementsByClassName("vs")[0].style["top"] = (imgHeight/2) + "px";

		}, 100 * i);
	}

	let buttonContainer = document.createElement("div");
	buttonContainer.setAttribute("class", "button-container");
	main.appendChild(buttonContainer);
	let randButton = createButton("randButton", "Generate More Matchups", () => {
		randomize(contestantArray);
	});
	buttonContainer.appendChild(randButton);
}

function showMatchup(contestantArray, index) {
	const leftContestant = document.getElementsByClassName("leftContestant")[0];
	const rightContestant = document.getElementsByClassName("rightContestant")[0];

	displayContestant(contestantArray[index], leftContestant, "contestant-left");
	displayContestant(contestantArray[index + 1], rightContestant, "contestant-right");
}

function clearMain() {
	document.documentElement.scrollTop = 0;	//go back to top of page
	if (document.getElementById("error")) {
		document.getElementById("error").innerHTML = ""; //clears any error messages
	}

	let main = document.getElementById("main");
	while (main && main.childNodes.length > 0) {
		main.removeChild(main.childNodes[0]);
	}
	return main;
}

function createButton(buttonId, buttonValue, buttonFunction) {
	let button = document.createElement("input");
	button.type = "button";
	button.setAttribute("class", "btn");
	button.id = buttonId;
	button.value = buttonValue;
	button.addEventListener("click", buttonFunction);

	return button;
}

//for text boxes because dear god there's so many
function createInput (inputId, placeholder, inputValue) {
	let input = document.createElement('input');
	input.type = "text";
	input.id = inputId;
	input.placeholder = placeholder;
	input.value = inputValue;

	return input;
}

//creates text that shows a tooltip when hovered
function createTooltip(text, desc) {
	let tooltip = document.createElement("abbr");
	tooltip.appendChild(document.createTextNode(text));
	tooltip.title = desc;

	return tooltip;
}


/* ======================== RANDOMIZER CUSTOMIZATION ============================= */


function makeCustomColorsForm() {
	let main = clearMain();

	//small description here
	main.appendChild(document.createTextNode("Note: if your browser clears cookies, it will reset after you close it!"));
	main.appendChild(document.createElement("br"));
	main.appendChild(document.createElement("br"));


	let form = document.createElement("form");
	form.id = "infoForm";
	main.appendChild(form);

	//input boxes for colours
	form.appendChild(createTooltip("Font: ",
		"Must be a font installed onto your device. \x0ADefault: Trebuchet MS"));
	let fontInput = createInput("fntName", "Font name", localStorage.getItem("fntName"));
	form.appendChild(fontInput);
	form.appendChild(document.createElement("br"));
	form.appendChild(createTooltip("Primary Color: ", 
		"Main colour used in most text and buttons. \x0ADefault: #111111"));
	let color1Input = createInput("color1", "#XXXXXX", localStorage.getItem("primaryColor"));
	form.appendChild(color1Input);
	form.appendChild(document.createElement("br"));

	form.appendChild(createTooltip("Secondary Color: ",
		"Accent colors for text and for buttons when hovered. \x0ADefault: #444444"));
	let color2Input = createInput("color2", "#XXXXXX", localStorage.getItem("secondaryColor"));
	form.appendChild(color2Input);
	form.appendChild(document.createElement("br"));

	form.appendChild(createTooltip("Button Text Color: ",
		"Color of button text and outlines. \x0ADefault: #ffffff"));
	let color3Input = createInput("color3", "#XXXXXX", localStorage.getItem("secondaryFontColor"));
	form.appendChild(color3Input);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));

	form.appendChild(createTooltip("Background Image: ",
		"Image must be hosted online and accessible through a valid image URL. \x0ARecommended size: Big enough to fit on your screen"));
	let bgInput = createInput("bgImg", "Image URL", localStorage.getItem("bgImg"));
	form.appendChild(bgInput);
	form.appendChild(document.createElement("br"));
	
	form.appendChild(createTooltip("Logo Image: ",
		"Image must be hosted online and accessible through a valid image URL. \x0AWill be automatically shrunk down to 175px tall."));
	let logoInput = createInput("logoImg", "Image URL", localStorage.getItem("logoImg"));
	form.appendChild(logoInput);
	form.appendChild(document.createElement("br"));

	form.appendChild(createTooltip("VS icon: ",
		"Icon displayed between two matched contestants. \x0ARecommended size: 150x150px"));
	let vsInput = createInput("vsImg", "Image URL", localStorage.getItem("vsImg"));
	form.appendChild(vsInput);
	form.appendChild(document.createElement("br"));
	let vsImg = document.createElement("img");
	vsImg.setAttribute("class", "vsImg");					
	form.appendChild(vsImg);
	form.appendChild(document.createElement("br"));


	submitButton = createButton("submitCustom", "Submit", () => {		//saves colours to localstorage and tells user to refresh to apply clrs
		const color1 = document.getElementById("color1").value;
		const color2 = document.getElementById("color2").value;
		const color3 = document.getElementById("color3").value;
		const bgImg = document.getElementById("bgImg").value;
		const logoImg = document.getElementById("logoImg").value; 
		const fntName = document.getElementById("fntName").value;
		const vsImg = document.getElementById("vsImg").value;
		
		//check for errors before saving clrs
		//if empty string, then we can just skip that color
		//if not an empty string, then check if it is valid before saving
		if (color1 != "") {
			if (!validColorHex(color1)) {
				document.getElementById("error").innerHTML = "Not a valid color hex code!";
				return;
			}
			localStorage.setItem("primaryColor", color1);
		}
		if (color2 != "") {
			if (!validColorHex(color2)) {
				document.getElementById("error").innerHTML = "Not a valid color hex code!";
				return;
			}
			localStorage.setItem("secondaryColor", color2);
		}
		if (color3 != "") {
			if (!validColorHex(color3)) {
				document.getElementById("error").innerHTML = "Not a valid color hex code!";
				return;
			}
			localStorage.setItem("secondaryFontColor", color3);
		}

		//do something to check that it is a valid img url... but that's for later
		localStorage.setItem("bgImg", bgImg);
		localStorage.setItem("logoImg", logoImg);
		localStorage.setItem("fntName", fntName);
		localStorage.setItem("vsImg", vsImg);
		
		location.reload(true);
		main = clearMain();
		main.appendChild(document.createTextNode("Please refresh to apply your colors!"));
	});

	resetButton = createButton("resetCustom", "Reset to default", () => {	//clears localstorage 
		localStorage.removeItem("primaryColor");
		localStorage.removeItem("secondaryColor");
		localStorage.removeItem("secondaryFontColor");
		localStorage.removeItem("bgImg");
		localStorage.removeItem("logoImg");
		localStorage.removeItem("fntName");
		localStorage.removeItem("vsImg");

		location.reload(true);
		main = clearMain();
		main.appendChild(document.createTextNode("Please refresh to apply!"));
	});

	form.appendChild(submitButton);
	form.appendChild(resetButton);
}

/// SOME LOCALSTORAGE STUFF
function applyCustomization() {
	const color1 = localStorage.getItem("primaryColor");
	const color2 = localStorage.getItem("secondaryColor");
	const buttonColor = localStorage.getItem("secondaryFontColor");
	const bg = localStorage.getItem("bgImg");
	const logo = localStorage.getItem("logoImg");
	const font = localStorage.getItem("fntName");
	const vs = localStorage.getItem("vsImg");

	let css = "";

	if (color1) css = css + changePrimColor(color1);
	if (color2) css = css + changeSecColor(color2);
	if (buttonColor) css = css + changeButtonColor(buttonColor);
	if (bg) css = css + changeBG(bg);
	if (logo) css = css + changeLogo(logo);
	if (font) css = css + changeFont(font);
	if (vs) css = css + changeVS(vs);
	
	let style = document.createElement("style");
	style.innerHTML = css;
	document.getElementsByTagName("head")[0].appendChild(style);
}

//checks if a string is a valid colour hex code (I probably didn't need to make this its own fn but it's neater this way at least)
function validColorHex(str) {

	//check that each character is a valid hex character with regex
	const hexPattern = /^#[0-9A-F]{6}$/i;
	return hexPattern.test(str);	//returns true if it matches the pattern
}

function changeVS(vsImg) {
	let css = `
	.vsImg {
		content: url("` + vsImg + `");
	}
	`;
	return css;
}

function changeFont(fntName) {
	let css = `
	:root {
		--generator-font: ` + fntName + `, Trebuchet MS;
	}
	`;
	return css;
}

function changeLogo(imgUrl) {
	let css = `
	#logo {
		content: url("` + imgUrl + `");
	}
	`;
	return css;
}

function changeBG(imgUrl) {
	let css = `
	body {
		background-image: url("` + imgUrl + `");
	}
	`;
	return css;
}

function changePrimColor(color) {
	//I hate my life
	let css = "";

	//change every occurrence of primary-colour in the CSS
	css = css + `
	body {
		color: ` + color + `;
	}
		
	.btn {
		background-color: ` + color + `;
	}

	.file {
		background-color: ` + color + `;
	}

	#infoForm {
		color: ` + color + `;
	}

	.display {
		color: ` + color + `;
	}

	.contestant-container {
		color: ` + color + `;
	}
	`;
	return css;
}

function changeSecColor(color) {
	let css = `
	h2 {
		color: ` + color + `;
	}

	.btn:hover {
		background-color: ` + color + `;
	}

	#header {
		color: ` + color + `;
	}

	#credit {
		color: ` + color + `;
	}
	`;
	return css;
}

function changeButtonColor(color) {
	let css = `
	.btn {
		border-color: ` + color + `;
		color: ` + color + `;
	}

	.btn:hover {
		color: ` + color + `;
	}

	.file {
		color: ` + color + `;
	}
	`;
	return css;
}