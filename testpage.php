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
    .left {
      float: left;
      margin-left: 500px;
    }
    .right {
      float: right;
      margin-right: 500px;
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
        $.each( data.ingredients, function( i, val ) {
          table += '<tr id="'+i+'">';
          table += '<td ' + (val.amount == null ? 'class="red"' : "") + ' id="'+i+'_amount">'+val.amount+'</td> ';
          table += '<td ' + (val.measure == null ? 'class="red"' : "") + ' id="'+i+'_measure">'+val.measure+'</td> ';
          table += '<td ' + (val.ingredient == null ? 'class="red ingr" onClick="popup(this);" ' : 'title="'+val.ingredient+'"') + ' id="'+i+'_ingredient">'+val.keyword.replace(val.amount + ' ' + val.measure, '').trim()+'</td> ';
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

  function ingredientsSearch() {
    var id = $("#dialog input[name='id']").val();
    var ingredient = $("#dialog input[name='ingredient']").val();

    var host = location.host;

    var url = 'http://'+host+':8080/api/ingredientsearch/';

    $.get(url + ingredient,function(data,status){
      if (status == 'success') {
        var results = '';
        $.each( data.result, function( i, val ) {
          results += "<div style='cursor: pointer;' onClick='replace(\""+id+"\", \""+htmlEscape(val.Long_Desc)+"\");'>"+val.Long_Desc+"</div>";
        })
        $("#dialog #searchResult").html(results);
      }
    });
  }

  function replace(id, newVal) {
    var idSplit = id.split("_");
    var line = idSplit[0]; // line number in text area
    var text = $("#rec").val().split("\n").filter(function(e){return e}); // text from textarea
    var amount = $("#"+ line + "_amount").text();
    var measure = $("#"+ line + "_measure").text();

    text[line] = amount + ' ' + measure + ' ' + newVal;
    text = text.join("\n");console.log(text);

    $("#rec").val(text);
    $("#"+id).text(newVal);

    calculate();

  }

  function removeRow(id) {
    var line = id; // line number in text area
    var text = $("#rec").val().split("\n").filter(function(e){return e}); // text from textarea

    text[line] = '';
    text = text.join("\n");console.log(text);

    $("#rec").val(text);
    $("#"+id).remove();

    calculate();
  }

  function popup(element) {// TODO we need measure corection also!!!
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