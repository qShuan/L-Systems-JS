//Thanks to - https://www.youtube.com/watch?v=feNVBEPXAcE - for motivating me to follow along and learn more about LSystems!

//Variables
var branchLengthFalloff = 0.9;
var branchWidthFalloff = 0.6;
var currentWidth;

//TODO: Make an input with custom presets given by the user

//Presets for generating
  const PRESETS = [
    {
      axiom: "X",
      rules: {
        "F": "FF",
        "X": "F+[-F-XF-X][+FF][--XF[+X]][++F-X]",
      }
    },
    {
      axiom: 'FX',
      rules: {
        "F": "FF+[+F-F-F]-[-F+F+F]",
      }    
    },
    {
      axiom: 'X',
      rules: {
        "F": "FX[FX[+XF]]",
        "X": "FF[+XZ++X-F[+ZX]][-X++F-X]",
        "Z": "[+F-X-F][++ZX]",
      }   
    },
  ]

const menu = document.querySelector("#settings");

//get DPI
let dpi = window.devicePixelRatio;

//get canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

//Set canvas width and height
canvas.width = window.innerWidth - menu.offsetWidth;
canvas.height = window.innerHeight;   

//fix_dpi(); - not needed currently

//Generate a new tree
onChange();

//https://medium.com/wdstack/fixing-html5-2d-canvas-blur-8ebe27db07da
function fix_dpi() {
    //get CSS height
    //the + prefix casts it to an integer
    //the slice method gets rid of "px"
    let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    //get CSS width
    let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    //scale the canvas
    canvas.setAttribute('height', style_height * dpi);
    canvas.setAttribute('width', style_width * dpi);
}

//Update current values based on input
function updateValues(){
    this.iterations = document.getElementById('iterations').valueAsNumber;
    this.branchLength = document.getElementById('branch-length').valueAsNumber;
    this.branchWidth = document.getElementById('branch-width').valueAsNumber;
    this.branchAngle = document.getElementById('branch-angle').valueAsNumber;
    this.leafLength = document.getElementById('leaf-length').valueAsNumber;
    this.leafWidth = document.getElementById('leaf-width').valueAsNumber;
    this.leafColor = document.getElementById('leaf-color').value;
    this.leafAlpha = document.getElementById('leaf-alpha').valueAsNumber;
    this.branchColor = document.getElementById('branch-color').value;
    this.presets = document.getElementById('presets').valueAsNumber;
    this.axiom = PRESETS[presets].axiom;
    this._rules = PRESETS[presets].rules;
    this.sentence = this.axiom;
}

//Generate a new sentence
function generateSentence(sentence){
    let newSentence = "";
    for(let i = 0; i < sentence.length; i++){
        let c = sentence[i];

        //const rule = this.FindMatchingRule(c);
        if(c in _rules){
            newSentence+=_rules[c];
        }
        else{
            newSentence+=c;
        }
    }
    return newSentence;
}

//Update the sentence
function applyRules(){
    let current = this.axiom;
    for(let i = 0; i < iterations; i++){
        current = generateSentence(current);

        this.branchLength *= this.branchLengthFalloff;
    }
    sentence = current;
}

//Render branches and leaves
function render(){
    //Clear the canvas and set the transform to the middle
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.transform(1, 0, 0, 1, canvas.width / 2, canvas.height);


    for(let i = 0; i < sentence.length; i++){
        let c = sentence[i];
        
        switch(c){
            case "F":
                //Dynamic width - not working idk how to do it
                currentWidth = branchWidth;
                const width1 = currentWidth;
                currentWidth *= (1 - (1 - branchWidthFalloff) ** 3);
                currentWidth = Math.max(branchWidth * 0.25, currentWidth);
                //const width2 = currentWidth;
                const width2 = width1;
                const len = branchLength;

                //Draw
                ctx.fillStyle = branchColor;
                ctx.beginPath();
                ctx.moveTo(-width2 / 2, -len - 1);
                ctx.lineTo(-width1 / 2, 1);
                ctx.lineTo(width1 / 2, 1);
                ctx.lineTo(width2 / 2, -len - 1);
                ctx.lineTo(-width2 / 2, -len - 1);
                ctx.closePath();
                ctx.fill();

                ctx.transform(1, 0, 0, 1, 0, -len);
            break;

            case "+":
                ctx.rotate(branchAngle * Math.PI / 180);
                break;
                
            case "-":
                ctx.rotate(-branchAngle * Math.PI / 180);
                break;

            case "[":
                ctx.save();
                break;

            case "]":
                ctx.fillStyle = leafColor;
                ctx.globalAlpha = leafAlpha;

                ctx.scale(leafWidth, leafLength);

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(1, -1);
                ctx.lineTo(0, -4);
                ctx.lineTo(-1, -1);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
                break;
        }
    }
}

//Call upon change in input
function onChange(){
    updateValues();
    applyRules();
    render();
}