let w1 = Math.round(window.innerWidth/100);
let w2 = Math.round(window.innerWidth/60);
let w3 = Math.round(window.innerWidth/40);


$('.tuneTable').hide();
$('.toggle-selection').on('click',function() {					
  $(this).text(function(_,currentText){
    return currentText == "▼ Choose A Tune" ? "▲ Choose A Tune" : "▼ Choose A Tune";
  });
  $('.tuneTable').toggle('slow');
});

let tuneTable = document.getElementById("tuneTable");
tuneTable.style['font'] = w3+'px';


let tuneSelection = document.getElementById("Tunes");
tuneSelection.style['font'] = w3+'px';
// tuneSelection.value
let cfCheckbox = document.getElementById("cantusFirmus");
cfCheckbox.style['font'] = w3+'px';
let cpCheckbox = document.getElementById("counterpoint");
cpCheckbox.style['font'] = w3+'px';
// cfCheckbox.checked

function launch() {
    let url = "ar.html?cf=" + cfCheckbox.checked + "&cp=" + cpCheckbox.checked + "&tune=" + tuneSelection.value;
    location.href = url;
}