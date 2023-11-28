const socket = io()

socket.on('allMessages', (data) => {
    console.log(data)
    render(data)
    let scrollPosition = document.getElementById('box')
    scrollPosition.scrollTop = scrollPosition.scrollHeight
})

const endChat = document.getElementById('endBtn')
endChat.addEventListener('click', closeConnection = () => {
    closeForm()
    socket.disconnect()
    socket.off()
})

addMessages = () => {
    let messaging = {
        user: document.getElementById('username').value,
        message: document.getElementById('usermessage').value
    }
    socket.emit('chatMessage', messaging)
    document.getElementById('usermessage').value = ''
    
    return false
}

render = (data) => {
    const html = data.map(element => {
        return (
            `
                <div>
                    <strong>${element.user}</strong> dice <em>${element.message}</em>
                </div>
            `
        )
    }).join(' ')
    
    document.getElementById('box').innerHTML = html
}

function openForm() {
    document.getElementById("chatForm").style.display = "block";
  }
  
  function closeForm() {
    document.getElementById("chatForm").style.display = "none";
  }