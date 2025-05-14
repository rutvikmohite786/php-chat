const SECRET_KEY = "mychatappkey458755!";
const socket = io("http://localhost:3000");

let userName = '';
let userAvatar = '';
let partnerName = '';
let partnerAvatar = '';
let currentRoom = null;
let isDarkMode = false;

socket.on('connect', function () {
    mySocketId = socket.id;
});

// Dark Mode Toggle
$('#darkModeToggle').click(function () {
    $('body').toggleClass('dark-mode');
    isDarkMode = !isDarkMode;
});

// Modal logic
const modal = new bootstrap.Modal(document.getElementById('userModal'));
modal.show();

$('.avatar-select').click(function () {
    $('.avatar-select').removeClass('border border-primary');
    $(this).addClass('border border-primary');
    $('#avatarChoice').val($(this).data('avatar'));
    if ($('#termsCheck').is(':checked')) {
        $('#joinBtn').prop('disabled', !$('#username').val());
    }
});

$('#username').on('input', function () {
    if ($('#termsCheck').is(':checked')) {
        $('#joinBtn').prop('disabled', !$(this).val() || !$('#avatarChoice').val());
    }
});

$('#termsCheck').on('change', function () {
    if ($(this).is(':checked')) {
        $('#joinBtn').prop('disabled', !$('#username').val() || !$('#avatarChoice').val());
    } else {
        $('#joinBtn').prop('disabled', true);
    }
});

$('#joinBtn').click(function () {
    userName = $('#username').val().trim();
    userAvatar = $('#avatarChoice').val() === 'male'
        ? 'man.png'
        : 'human.png';

    socket.emit('user_info', { name: userName, avatar: userAvatar });
    modal.hide();
});

socket.on('waiting', msg => $('#status').text(msg));

socket.on('room_created', data => {
    currentRoom = data.room;
    partnerName = data.partner.name;
    partnerAvatar = data.partner.avatar;

    $('#status').text("You're connected!");
    $('#partnerName').text(partnerName);
    $('#partnerAvatar').attr('src', partnerAvatar);
    $('#partnerInfo').removeClass('d-none');

    $('#chat').removeClass('d-none');
    $('#messageControls').removeClass('d-none');
});

$('#send').click(function () {
    $('#emojiPicker').hide();
    const message = $('#input').val().trim();
    if (!message || !currentRoom) return;

    const encrypted = CryptoJS.AES.encrypt(message, SECRET_KEY).toString();

    socket.emit('encrypted_message', {
        room: currentRoom,
        encrypted
    });

    $('#chat').append(`
    <div class="message you">
        ${message}
    </div>
`);

    $('#input').val('');
    $('#chat').scrollTop($('#chat')[0].scrollHeight);
});

$('#input').on('keypress', function (e) {
    if (e.which === 13 && !e.shiftKey) {
        e.preventDefault();
        $('#send').click();
    }
})

socket.on('receive_encrypted', function (data) {
    const decrypted = CryptoJS.AES.decrypt(data.encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    $('#chat').append(`
    <div class="message partner">
        ${decrypted}
    </div>
`);
    $('#chat').scrollTop($('#chat')[0].scrollHeight);
});

// Typing indicator
$('#input').on('input', function () {
    socket.emit('typing', currentRoom);
});

socket.on('partner_typing', function () {
    $('#typingIndicator').text(partnerName + ' is typing...')
    $('#typingIndicator').show();
    setTimeout(() => $('#typingIndicator').hide(), 3000);
});

socket.on('partner_disconnected', () => {
    $('#chat').append('<div class="text-muted text-center">' + partnerName + '   has disconnected.</div>');
    $('#messageControls').hide();
});

// Emoji Picker
$('#emojiBtn').click(function () {
    $('#emojiPicker').toggle();
});

$('#emojiPicker button').click(function () {
    const emoji = $(this).data('emoji');
    $('#input').val($('#input').val() + emoji);
    // $('#emojiPicker').hide();
});

socket.on('seen_by_partner', function (senderId) {
    if (senderId === mySocketId) {
        $('.status').last().text('✓✓ Seen');
    }
});
