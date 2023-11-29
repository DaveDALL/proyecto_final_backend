const fecthingRoll = async () => {
    let uid = document.getElementById("uid").value
    try {
        let response = await fetch(`http://${window.location.host}/api/users/${uid}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
              }
        })
        let result = await response.json() 
    }catch(err) {
        console.log('Error al cambiar el roll de usuario ' + err)
    }
}