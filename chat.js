var socket = io.connect("http://127.0.0.1:3000");

socket.on('connect', () => {
    // console.log(socket.id);
    $('#socket_id').val(socket.id)
});

socket.once("message", (mess) => {
    // console.log(mess)
});

socket.on('creatroom', (room) => {
    // console.log(room);
    $('#room_id').val(room)
});

$("#send").click(function() {
    let roomname = $('#room_id').val()
    let message = $('#text').val()
    let socket_id = $('#socket_id').val()
    if(message!=''){
    socket.emit("sendmes", roomname, message, socket_id);
    }
    $('#text').val('')
});

$('#text').keypress(function(e) {
    var key = e.which;
    let roomname = $('#room_id').val()
    let message = $('#text').val()
    let socket_id = $('#socket_id').val()
    if (key == 13 && message!='') // the enter key code
    {
      socket.emit("sendmes", roomname, message, socket_id);
      $('#text').val('')
    }
});

socket.on('sendmessage', (mes, id) => {
    let socket_id = $('#socket_id').val()
    $('#text').val('')
    if (socket_id == id) {
        $('.msg-text').last().after('<div class="msg-text owner"><span class="text">' + mes + '</span></div>')
    } else {
        $('.msg-text').last().after('<div class="msg-text"><span class="text">' + mes + '</span></div>')
    }
});
