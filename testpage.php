<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Recipe Analysis</title>
  <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css">
  <script src="//code.jquery.com/jquery-1.10.2.js"></script>
  <script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
  <script>
  </script>
  <style>
    .unit_select {
      list-style: none;
    }
    .unit_select li:hover {
      background-color: aqua;
      cursor: pointer;
    }
    .left {
      float: left;
      margin-left: 200px;
    }
    .right {
      float: right;
      margin-right: 200px;
    }
    textarea { width:500px; height: 250px;}
    .red {
      background-color: red;
      cursor: pointer;
    }
    table, th, td {
      border: 1px solid black;
    }
  </style>
</head>
<body>
<div class="left">
   <div id="recipeTextarea">
    <form action="/" id="recipeForm">
      <textarea id="rec"></textarea>
      <input type="submit" value="Submit">
    </form>
  </div>
  <div id="result" style="display:none;">
    <table id="ingredientsTable"></table>
    <button onclick="openTextarea();">Edit ingredients</button>
  </div>
</div>

<div class="right">
  <table id="calculationResult" style="display:none;">
    <tr>
      <th>Calculation</th>
    </tr>
  </table>
</div>

<div style="clear: both"></div>

<script>
// Attach a submit handler to the form
$( "#recipeForm" ).submit(function( event ) {
  // Stop form from submitting normally
  event.preventDefault();

  calculate();
});

  function calculate() {

    var host = location.host;

    // Get some values from elements on the page:
    var $form = $( this ),
      term = $("#rec").val();
      if (term.length < 1) {
        return false;
      }
      //url = 'http://104.131.17.237:8080/api/recipecheck';
      url = 'http://'+host+':8080/api/recipecheck';

    $.ajax({

      url : url,

      type: 'POST',

      dataType : "json",

      data: {ingredients: term},

      success:function(data) {
        var table = '<tr><th>Amount</th><th>Measure</th><th>Ingredient</th><th>Delete</th></tr>';
        $("#recipeTextarea").hide();
        $("#result").show();
        var number;
        var gramArr = ['g', 'grams', 'gram', 'gr'];

        $.each( data.ingredients, function( i, val ) {
          if (val.no != null) {
            number = 'num="' + val.no + '"';
          } else {
            number = '';
          }
          table += '<tr id="'+i+'">';
          table += '<td ' + (val.amount == null ? 'class="red"' : "") + ' id="'+i+'_amount">'+val.amount+'</td> ';
          if (gramArr.indexOf(val.measure) >= 0) {
            table += '<td '+ number +' onClick="measureDropDown(this);" id="'+i+'_measure">'+val.measure+'</td> ';
          }
          else if (val.measure == null || val.ingredient == null || parseSelected(val.measureFound.toLowerCase()) != val.measure.toLowerCase()) {
            table += '<td '+ number +' class="red" onClick="measureDropDown(this);" id="'+i+'_measure">'+val.measure+'</td> ';
          } else {
            table += '<td '+ number +' onClick="measureDropDown(this);" id="'+i+'_measure">'+val.measure+'</td> ';
          }
//          table += '<td ' + (val.measure == null ? 'class="red" onClick="popup(this);" ' : '') + ' id="'+i+'_measure">'+val.measure+'</td> ';
          if (val.ingredient == null) {
            table += '<td class="red ingr" onClick="popup(this);" id="'+i+'_ingredient">'+val.keyword.replace(val.amount + ' ' + val.measure, '').trim()+'</td> ';
          } else {
            table += '<td title="'+val.ingredient+'" onClick="popup(this);" id="'+i+'_ingredient" title="'+val.ingredient+'" onClick="popup(this);" >'+val.ingredient.trim()+'</td> ';
          }
//          table += '<td ' + (val.ingredient == null ? 'class="red ingr" onClick="popup(this);" ' : 'title="'+val.ingredient+'" onClick="popup(this);" ') + ' id="'+i+'_ingredient">'+val.keyword.replace(val.amount + ' ' + val.measure, '').trim()+'</td> ';
          table += '<td class="red" onClick="removeRow('+i+');"> X</td>';
          table += '</tr>';
        });
        $("#ingredientsTable").html(table);

        table = '';
        $.each( data.recipeSum, function( i, val ) {
          if (val > 0) {
            table += '<tr>';
            table += '<td>' + i.replace("_", " ") + '</td>';
            table += '<td>' + val + '</td>';
            table += '<tr>';
          }

          $("#calculationResult").html(table).show();
        });
      },


      error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.responseText);
        console.log(thrownError);
      }

    }

    );
  }

  function parseSelected(selected) {

//    var selects = selected.split(" ");
//
//    if (selects.length > 0) {
//      return selects[0].replace(/[^\w\s]/gi, '');
//    }
    if (selected.indexOf("(") > -1) {
      var result = selected.split("(");
      selected = result[0].trim();
    }

    return selected.replace(/[^\w\s]/gi, '').replace(/ /g, "_");

//    return selected;
  }

  function selectUnit(element) {
    var selected = $(element).text();
    var selectedElement = $(element).closest("td");
    var id = selectedElement.attr("id");

    selected = parseSelected(selected);

    $(selectedElement).text(selected);
    setTimeout(function(){
      $(selectedElement).prop('disabled', false).removeAttr("disabled").attr("onClick", "measureDropDown(this);");
    }, 500);

    replaceIngr(id, selected, 'measure', false);
  }

  function measureDropDown(element) {
    var host = location.host;
    var url = 'http://'+host+':8080/api/measuresearch/';
    var number = $(element).attr("num");
    if (number == undefined) {
      number = 'all';
    }

    $.get(url + number,function(data,status){
      if (status == 'success') {
        var html = '<ul class="unit_select">';

        $.each( data.result, function( i, val ) {
          html += '<li onclick="selectUnit(this);">'+ val +'</li>'
        })
        html += '<li onclick="selectUnit(this);">gram</li></ul>'


        $(element).removeAttr("onClick");
        $(element).attr('disabled','true');
        $(element).removeAttr("class");
        $(element).html(html);
      }
    });
  }

  function ingredientsSearch() {
    var id = $("#dialog input[name='id']").val();
    var ingredient = $("#dialog input[name='ingredient']").val();

    var host = location.host;

    var url = 'http://'+host+':8080/api/ingredientsearch/';

    $.get(url + ingredient,function(data,status){
      if (status == 'success') {
        var results = '';
        $.each( data.result, function( i, val ) {
          results += "<div style='cursor: pointer;' onClick='replaceIngr(\""+id+"\", \""+htmlEscape(val.Long_Desc)+"\", \"ingredient\", \""+htmlEscape(val.NDB_No)+"\");'>"+val.Long_Desc+"</div>";
        })
        $("#dialog #searchResult").html(results);
      }
    });
  }

  function replaceIngr(id, newVal, dataType, no) {
    var idSplit = id.split("_");
    var line = idSplit[0]; // line number in text area
    var text = $("#rec").val().split("\n").filter(function(e){return e}); // text from textarea
    var amount = $("#"+ line + "_amount").text();

    if (dataType == 'ingredient') {

      var measure = $("#"+ line + "_measure").text();
      text[line] = amount + ' ' + measure + ' ' + newVal;
      if (no) {
        setTimeout(function(){
          $("#" + line + "_measure").attr('num', String(no));
        }, 500);
      }

    } else if (dataType == 'measure') {

      var ingredient = $("#"+ line + "_ingredient").text();
      text[line] = amount + ' ' + newVal + ' ' + ingredient;

    } else {
      return false;
    }

    $("#"+id).text(newVal);
    text = text.join("\n");

    $("#rec").val(text);

    calculate();

  }

  function removeRow(id) {
    var line = id; // line number in text area
    var text = $("#rec").val().split("\n").filter(function(e){return e}); // text from textarea

    text[line] = '';
    text = text.join("\n");

    $("#rec").val(text);
    $("#"+id).remove();

    calculate();
  }

  function popup(element) {
    $("#dialog #searchResult").empty();
    $( "#dialog input[name='id']" ).val(element.id);
    $( "#dialog input[name='ingredient']" ).val(element.innerHTML);
    $( "#dialog" ).dialog();
  }

  function openTextarea() {
    $("#recipeTextarea").show();
    $("#result").hide();
  }

  function htmlEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
  }
</script>
 <div id="dialog" title="Ingredient Search" style="display: none">
   <input type="text" name="ingredient">
   <input type="hidden" name="id">
   <button onClick="ingredientsSearch();" name="ingredientSearch">Search</button>
   <div id="searchResult"></div>
 </div>
 
</body>
</html>