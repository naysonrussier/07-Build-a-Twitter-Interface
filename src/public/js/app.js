refresh();

//Post a new tweet
$("form").submit(function(event) {
  event.preventDefault();
  var $this = $(this);
  $.ajax({
      url: $this.attr('action'),
      type: $this.attr('method'),
      data: $this.serialize(),
      success: function(res) {
        if(res === 'Success') {
          $("#tweet-textarea")[0].value = "";
          alert("Your tweet has been successfully sent!");
          timeline();
        } else {
          window.location.href = '/error';
        }
      }
  });
});

//change filter for direct_messages
function changeSelect() {
  var user = parseInt($("#user_select").val());
  $.post("/userlist", {user: user}, function(res) {
    if (res === "Success") {
      messages();
    }
  });
}

//disable new tweet if message length is more than 140
$("#tweet-textarea").keyup(function(event) {
  var number = $(this).val().length;
    $("#tweet-char").text(140-number);
  if (number > 140) {
    $("#tweet-char").css("color", "red");
    $(".tweet-button").attr('disabled', true);
  } else {
    $("#tweet-char").css("color", "#ccc");
    $(".tweet-button").removeAttr('disabled', false);
  }
});


function refresh() {
  timeline();
  follow();
  messages();
}

//Using AJAX to show different element on the page

function timeline() {
  $.get('/timeline', function(data) {$(".app--tweet--list").html(data)});
}

function follow() {
  $.get('/follow', function(data) {$(".app--user--list").html(data)});
}

function messages() {
  $.get('/messages', function(data) {$(".app--message--list").html(data)});
}