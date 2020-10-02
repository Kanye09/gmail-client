const test = 'This is a text';
//this is test bellow
let myData;
let currDisplayedData;
let dropdownForSearch = document.querySelector('.search-displayer');
let main = document.querySelector('.email');
let tabs = document.querySelector('.tab');
let tabsBorder = document.querySelectorAll('.bottom');
let social;
let promotions;
let updates;
let searchedResult = {};
const searchBar = document.querySelector('#search');

for (let i = 0; i < tabs.children.length; i++) {
  tabs.children[i].setAttribute('area-label', tabs.children[i].innerText);
  tabsBorder[i].setAttribute('area-label', tabs.children[i].innerText);
}

fetch('https://polar-reaches-49806.herokuapp.com/api?page=1&category=primary')
  .then((response) => response.json())
  .then((data) => {
    onReady(data);
  })
  .catch((error) => {
    console.log(error);
  });

function onReady(fetchedData) {
  myData = fetchedData;
  myData = addIdToData(myData);
  social = toSocial(myData);
  promotions = toPromotions(myData);
  updates = toUpdates(myData);
  listAllEmails(myData);
  tabs.children[0].click();
}

//event Listener on tabs
tabs.addEventListener('click', tabsClicked);
function tabsClicked(e) {
  if (e.target.nodeName !== 'DIV') return;
  let curr = e.target;
  for (let i = 0; i < tabsBorder.length; i++) {
    tabsBorder[i];
    tabs.children[i].removeAttribute('style');
    if (tabsBorder[i].classList.contains('tabs')) {
      tabsBorder[i].classList.remove('tabs');
    }
    tabsBorder[i].style.backgroundColor = 'transparent';
  }
  curr.children[1].classList.add('tabs');
  curr.style.color = tabsColor(curr);
  curr.children[1].style.backgroundColor = tabsColor(curr);
  let data = getUndeletedEmails();
  listAllEmails(data);
}

// HELPER FUNCTION ADDED NEW
function detectWhichTab() {
  let tab = document.querySelector('.active');
  let target = tab.getAttribute('area-label');
  let subData;
  switch (target) {
    case 'Social':
      subData = social;
      break;
    case 'Promotions':
      subData = promotions;
      break;
    case 'Updates':
      subData = updates;
      break;
    default:
      subData = myData;
  }
  return subData;
}

// HELPER FUNCTION ADDED NEW
function removeAllFromDom() {
  main = document.querySelector('.email');
  while (!main.lastElementChild.hasAttribute('status')) {
    main.removeChild(main.lastElementChild);
  }
}

//HELPER FUNCTION ADDED NEW
function tabsColor(curr) {
  document.querySelectorAll('.tabs-hover').forEach((val) => {
    val.classList.remove('active');
  });
  /// loop tabs ad remove active class
  curr.classList.add('active');
  let current = curr.getAttribute('area-label');
  return current == 'Primary'
    ? '#D93025'
    : current == 'Social'
    ? '#1A73E8'
    : current == 'Promotions'
    ? '#188038'
    : '#DD7607'; //then it's gotta be updates
}

function listAllEmails(data) {
  currDisplayedData = data;
  removeAllFromDom();

  let list = document.querySelector('[status="template"]');
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  for (let i = 0; i < data.items.length; i++) {
  
    let anEmail = list.cloneNode(true);

    if (myData.items[i].tags.isTrash !== true) {
      main.appendChild(anEmail);
      anEmail.style.display = 'block';
      anEmail.removeAttribute('status');
      let senderName = document.querySelectorAll('.sender-name')[i + 1];
      let senderEmail = document.querySelectorAll('.sender-email')[i + 1];
      let messageTitle = document.querySelectorAll('.message-title')[i + 1];
      let message = document.querySelectorAll('.message')[i + 1];
      let emailTime = document.querySelectorAll('.email-time')[i + 1];
      let emailDate = new Date(data.items[i].date);
      let stringDate = `${emailDate.getDate()} ${monthNames[emailDate.getMonth()].substr(0, 3)}`;
      senderName.innerHTML = data.items[i].senderName;
      senderEmail.innerHTML = data.items[i].senderEmail;
      messageTitle.innerHTML = data.items[i].messageTitle;
      message.innerHTML = data.items[i].messages[0].message;
      emailTime.innerHTML = stringDate;
      anEmail.setAttribute('data-id', data.items[i].id);
      anEmail.addEventListener('click', openEmail);
    }   
  }
}

function addIdToData(data) {
  for (let i = 0; i < data.items.length; i++) {
    data.items[i].id = i;
  }
  return data;
}

function formatDate(date, format) {
  let result = '';
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const acceptedFormats = ['forEmailList', 'forOpennedEmail', 'forSearResults'];
  if (acceptedFormats.includes(format)) {
    switch (format) {
      case acceptedFormats[0]:
        result = `${date.getDate()} ${monthNames[date.getMonth()].substr(0, 3)}`;
        break;
      case acceptedFormats[1]:
        result = `
        ${date.getDate()} 
        ${monthNames[date.getMonth()].substr(0, 3)} 
        ${date.getFullYear()}, 
        ${date.getHours()}:${date.getMinutes()}
        `;
        break;
      case acceptedFormats[1]:
        result = `${date.getMonth()} ${date.getDate()} ${date.getFullYear() % 100}`;
        break;
    }
  } else {
    console.log('Date format not supported');
  }
  return result;
}

function toSocial(data) {
  let social = {};
  social.items = data.items.filter((i) => {
    return (i.senderName == 'Facebook' || i.senderName == 'Seytech Co') && !i.tags.isTrash && !i.tags.isSpam;
  });
  social.next = data.next;
  social.next.page = social.items.length < 50 ? 1 : 2;
  social.total = social.items.length;
  return social;
}

//THIS SECTION IS FOR FILTERING RAW DATA
function toPromotions(data) {
  let promotions = {};
  promotions.items = data.items.filter((i) => {
    return (i.senderName == 'Chase' || i.senderName == 'Seytech Co') && !i.tags.isTrash && !i.tags.isSpam;
  });

  promotions.next = data.next;
  promotions.next.page = promotions.items.length < 50 ? 1 : 2;
  promotions.total = promotions.items.length;
  return promotions;
}

function toUpdates(data) {
  let updates = {};
  updates.items = data.items.filter((i) => {
    return (i.senderName == 'Michael Dunn' || i.senderName == 'Seytech Co') && !i.tags.isTrash && !i.tags.isSpam;
  });
  updates.next = data.next;
  updates.next.page = updates.items.length < 50 ? 1 : 2;
  updates.total = updates.items.length;
  return updates;
}

// OPEN INDIVIDUAL EMAIL
function openEmail(event) {
  let curID;
  let currElement = event.target;
  let curID = getIdOfEmailClicked(currElement);
  let openWindowEmail = document.querySelector('.opened-email');
  let email;
  event.stopPropagation()
  event.preventDefault()
  event.stopImmediatePropagation()
  if (event.target.classList.contains('fa-trash')) {
    deleteEmail(event.target.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('data-id'));
    console.log(event.target.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('data-id'));
    return;
  }
  if (myData) {
    let openWindowEmail = document.querySelector('.opened-email');
    curID = getIdOfEmailClicked(currElement);
    myData.items[curID].isRead = true;
    updateCurrDisplayedData();
    removeAllFromDom();
    hideMainCheckBox();
    openWindowEmail.style.display = 'block';
    let senderName = document.querySelector('.sender-full-name');
    senderName.innerHTML = myData.items[curID].senderName;
    let emailAddress = document.querySelector('.sender-email-open');
    emailAddress.innerHTML = myData.items[curID].senderEmail;
    let emailSubject = document.querySelector('.subject');
    emailSubject.innerHTML = myData.items[curID].messageTitle;
    let emailMessage = document.querySelector('.message-open');
    emailMessage.innerHTML = myData.items[curID].messages[0].message;
    let emailTime = document.querySelector('.time-date-openned');
    let emailDate = new Date(myData.items[curID].date);
    let stringDate = formatDate(emailDate, 'forOpennedEmail');
    emailTime.innerHTML = stringDate;
  }
}

function hideMainCheckBox() {
  let mainCheckBox = document.querySelector('#selectAll');
  mainCheckBox.style.display = 'none';
  let arrowDown = document.querySelector('.fa-caret-down');
  arrowDown.style.display = 'none';
  let returnButton = document.querySelector('.return');
  returnButton.style.display = 'block';
  returnButton.addEventListener('click', closeOpenedEmail);
}

function closeOpenedEmail() {
  let mainCheckBox = document.querySelector('#selectAll');
  mainCheckBox.style.display = 'block';
  let arrowDown = document.querySelector('.fa-caret-down');
  arrowDown.style.display = 'block';
  let returnButton = document.querySelector('.return');
  returnButton.style.display = 'none';
  let openWindowEmail = document.querySelector('.opened-email');
  openWindowEmail.style.display = 'none';
  listAllEmails(currDisplayedData);
}

function getIdOfEmailClicked(element) {
  let checkedElement = element;
  while (!checkedElement.hasAttribute('data-id')) {
    checkedElement = checkedElement.parentElement;
  }
  return checkedElement.getAttribute('data-id');
}


// DELETING EMAIL

function deleteEmail(id) {
  myData.items[id].tags.isTrash = true;
  listAllEmails(myData);
  console.log(id)
  // console.log(myData.items[id].isTrash);
}
