
$('.tuneTable').hide();
$('.toggle-selection').on('click',function() {					
  $(this).text(function(_,currentText){
    return currentText == "▼ Choose A Tune" ? "▲ Choose A Tune" : "▼ Choose A Tune";
  });
  $('.tuneTable').toggle('slow');
});


let tuneSelection = document.getElementById("Tunes");
// tuneSelection.value
let cfCheckbox = document.getElementById("cantusFirmus");
let cpCheckbox = document.getElementById("counterpoint");
// cfCheckbox.checked

function launch() {
    let url = "ar.html?cf=" + cfCheckbox.checked + "&cp=" + cpCheckbox.checked + "&tune=" + tuneSelection.value;
    location.href = url;
}