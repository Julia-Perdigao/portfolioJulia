var delivery = document.getElementById("delivery");
delivery.addEventListener("mouseover",function(){
    let quadrado = document.getElementById("quadrado");
    quadrado.style.backgroundImage = "url(delivery.png)";
})

var ogani = document.getElementById("ogani");
ogani.addEventListener("mouseover",function(){
    let ogani = document.getElementById("quadrado");
    quadrado.style.backgroundImage = "url(ogani.png)";
})

var fotografia = document.getElementById("fotografia");
fotografia.addEventListener("mouseover",function(){
    let quadrado = document.getElementById("quadrado");
    quadrado.style.backgroundImage = "url(fotografia.png)";
})

function lightMode() {
    var element = document.body;
    element.classList.toggle("lightMode");
  }


