function clientRegister() {
  let form = document.getElementById('clientRegister')
  let formData = new FormData(form)
  fetch('http://localhost:3000/client', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({name: formData.get('name'), cpf: formData.get('cpf')})
  }).then((result) => {
    result.json().then(data => {
      if (data['created'] == 'false') {
        alert('Falha no cadastro do cliente!')
      } else {
        alert('Cliente cadastrado com sucesso!')
      }
    })
  })
}

function clientLogin() {
  let form = document.getElementById('loginForm')
  let formData = new FormData(form)
  fetch('http://localhost:3000/client/auth', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({name: formData.get('name'), cpf: formData.get('cpf')})
  }).then((result) => {
    if(result.status == 200) {
      window.location.href='/clinica/panel.html'
    } else {
      alert('Nome ou CPF inválidos!')
    }
  })
  .catch(error => {
    console.error(error)
  })
}

function panel() {
  document.getElementById('calendar').valueAsDate = new Date();

  fetch('http://localhost:3000/client/panel', {
    method:'GET',
    credentials:'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((result) => {
    if(result.status == 401) {
      window.location.href='/clinica/index.html'
    }
    result.json().then(data => {
      document.getElementById('login_user').innerHTML = data['name']
    })
  })
}

function newAnimal() {
  let form = document.getElementById('newAnimal')
  let formData = new FormData(form)

  const rawResponse = fetch('http://localhost:3000/client/panel/animal', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.get('nameAnimal'), 
      age: formData.get('ageAnimal'), 
      type: formData.get('typeAnimal')
    })
  }).then((result) => {
    if (result.status == 201) {
      alert('Pet cadastrado com sucesso')
    } else {
      alert('Falha no cadastro do Pet')
    }
  })
}

function newOption(value, name, geriatrician) {
  let newOption = document.createElement('option')

  if(geriatrician === true) {
    newOption.innerHTML= name + ' (Especialista)'
  } else {
    newOption.innerHTML= name 
  }

  newOption.value = value
  return newOption
}

function listPets() {
  let select = document.getElementById('petClient')
  fetch('http://localhost:3000/client/panel/animal', {
    method: 'GET',
    credentials:'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((result) => {
    result.json().then(data => {      
      for (pet of data) {
        select.appendChild(newOption(pet['id'], pet['name'], false))
      }
    })
  })
}

function listVets(id) {
  let select = document.getElementById('vetPreference')
  let type
  let age
  fetch(`http://localhost:3000/client/panel/animal?id=${id}`, {
    method: 'GET',
    credentials:'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((response) => {
    response.json().then(data => {
      type = data['type']
      age = data['age']

      fetch(`http://localhost:3000/client/panel/vet?type=${type}&age=${age}`, {
        method: 'GET',
        credentials:'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }).then((result) => {
        result.json().then(data => {      
          select.innerHTML = '<option value="0">Não tenho preferência</option>'
          for (vet of data) {
            select.appendChild(newOption(vet['id'], vet['name'], vet['geriatrician']))
          }
        })
      })
      
    })
  })
}

function listAvailableTimes() {
  let form = document.getElementById('scheduleForm')
  let formData = new FormData(form)
  let calendar = document.getElementById('calendar').value
  let hours = document.getElementById('hour')

  fetch(`http://localhost:3000/client/panel/schedule?day=${calendar}&pet=${formData.get('petClient')}&vet=${formData.get('vetPreference')}`, {
    method: 'GET',
    credentials:'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((result) => {
    result.json().then(data => {
      hours.innerHTML = ''
      for (hour of data.hours) {
        hours.appendChild(newOption(hour, hour, false))
      }
    })
  })
}

function schedule() {
  let form = document.getElementById('scheduleForm')
  let formData = new FormData(form)

  fetch('http://localhost:3000/client/panel/schedule', {
    method: 'POST',
    credentials:'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vet: formData.get('vetPreference'),
      pet: formData.get('petClient'),
      schedulingDate: formData.get('calendar'),
      hour: formData.get('hour')
    })
  }).then((response) => {
    response.json().then(data => {
      if(data.error) {
        alert(data.error)
      } else if(data.created == "true") {
        alert('Consulta marcada com sucesso')
      } else {
        alert('Não foi possivel fazer o agendamento')
      }
    })
  })
}

function getTreatments() {
  let table = document.getElementById("treatments")

  fetch('http://localhost:3000/clinic/schedules', {
    method: 'GET',
    credentials:'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((response) => {
    response.json().then(data => {
      for (schedules of data) {
        let newRow = table.insertRow(-1)
        let newClient = newRow.insertCell(0)
        let newPet = newRow.insertCell(1)
        let newVet = newRow.insertCell(2)
        let newschedulingDate = newRow.insertCell(3)
        let newDiagnosis = newRow.insertCell(4)
        
        let form = document.createElement('form')
        let textArea = document.createElement('textarea')
        let btnAction = document.createElement('button')
        textArea.setAttribute('name', 'diagnosis')
        btnAction.innerHTML = 'Salvar'
        form.appendChild(textArea)
        form.appendChild(btnAction)
        form.setAttribute('action', `javascript:saveTreatments(${schedules.id})`)
        form.setAttribute('id', schedules.id)
    
        newClient.appendChild(document.createTextNode(schedules.clientData && schedules.clientData.name))
        newVet.appendChild(document.createTextNode(schedules.vetData && schedules.vetData.name))
        newPet.appendChild(document.createTextNode(schedules.petData && schedules.petData.name))
        newschedulingDate.appendChild(document.createTextNode(schedules.schedulingDate))
        newDiagnosis.appendChild(form)
      }
    })
  })

  fetch('http://localhost:3000/clinic/treatment', {
    method: 'GET',
    credentials:'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((response) => {
    response.json().then(data => {
      for (treatment of data) {
        let form = document.getElementById(treatment.schedule)
        console.log(form.firstChild.value = treatment.diagnosis)
      }
    })
  })
}

function saveTreatments(id) {
  let form = document.getElementById(id)
  let formData = new FormData(form)

  fetch('http://localhost:3000/clinic/treatment', {
    method: 'POST',
    credentials:'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      diagnosis: formData.get('diagnosis'),
      schedule: id
    })
  })
}

function listTreatments() {
  let table = document.getElementById("treatments")

  fetch('http://localhost:3000/client/panel/treatment', {
    method: 'GET',
    credentials:'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((response) => {
    response.json().then(data => {
      for (treatment of data) {
        let newRow = table.insertRow(-1)
        let vet = newRow.insertCell(0)
        let pet = newRow.insertCell(1)
        let schedulingDate = newRow.insertCell(2)
        let diagnosis = newRow.insertCell(3)
    
        vet.appendChild(document.createTextNode(treatment.scheduleData && treatment.scheduleData.vetData.name))
        pet.appendChild(document.createTextNode(treatment.scheduleData && treatment.scheduleData.petData.name))
        schedulingDate.appendChild(document.createTextNode(treatment.scheduleData && treatment.scheduleData.schedulingDate))
        diagnosis.appendChild(document.createTextNode(treatment.diagnosis))
      }
    })
  })
}