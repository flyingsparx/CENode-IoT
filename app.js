/*
 * Construct a model to represent the 'world' of the hue bulbs and an
 * interaction method.
 */
const lightModel = [
  'conceptualise a ~ hue bridge ~ h that has the value V as ~ address ~ and has the value W as ~ token ~',
  'conceptualise a ~ hue bulb ~ h that has the value C as ~ code ~ and has the value V as ~ strength ~',
  'conceptualise an ~ iot card ~ I that is a card and ~ targets ~ the hue bulb D and has the value P as ~ power ~ and has the value B as ~ brightness ~ and has the value S as ~ saturation ~ and has the value H as ~ hue ~ and has the value C as ~ colour ~',
  'there is a hue bridge named bridge1 that has \'xxx.xxx.xx.x\' as address and has \'abc123\' as token',
];

/*
 * Instantiate CENode instance with the standard core and our 'light' model
 */
const node = new CENode(CEModels.core, lightModel);
const hueBridge = node.concepts.hue_bridge.instances[0];
updateBulbs();
node.attachAgent();
node.agent.setName('House');

/*
 * Add a handler for 'iot' cards to make a hue API request
 */
node.agent.cardHandler.handlers['iot card'] = (card) => {
  if (card.targets){
    const data = {};
    if (card.power) data.on = card.power === 'on';
    if (card.brightness) data.bri = parseInt(card.brightness)
    if (card.saturation) data.sat = parseInt(card.saturation)
    if (card.hue) data.hue = parseInt(card.hue)
    request('PUT', hueBridge, '/lights/' + card.targets.code + '/state', data);
  }
};

/*
 * UI utilities and event bindings and basic speech recognition
 */

function request(method, bridge, path, data, callback){
  const xhr = new XMLHttpRequest();
  xhr.open(method, 'http://' + bridge.address + '/api/' + bridge.token + path);
	xhr.onreadystatechange = () => {
    if(xhr.readyState === 4 && xhr.status === 200 && callback) {
      callback(JSON.parse(xhr.responseText));
    }
  };
  xhr.send(data && JSON.stringify(data));
}

function updateBulbs (){
  if (hueBridge.address && hueBridge.token){
    request('GET', hueBridge, '/lights', null, data => {
      for (const light in data){
        if (!node.getInstanceByName(data[light].name)){
          addCE('there is a hue bulb named \'' + data[light].name + '\' that has \'' + light + '\' as code');
        }
      }
    });
  }
}

function addCE(ce){
  document.querySelector('#last-instruction').value = ce;
  node.addCE(ce);
  const oldSentences = document.querySelector('#submitted-sentences');
  oldSentences.innerHTML = ce + '<br><br>' + oldSentences.innerHTML;
}

setInterval(() => {
  const list = document.querySelector('#lights');
  list.innerHTML = '';
  for (const light of node.getInstances('hue bulb')){
    list.innerHTML += `<li name="${light.name}">
      ${light.name} - 
      <button class="power" name="on">on</button> <button class="power" name="off">off</button> 
    </li>`;
  }
  for (const elem of document.querySelectorAll('li .power')){
    elem.onclick = () => addCE(`there is an iot card named {uid} that is to the agent House and has 'instruction' as content and targets the hue bulb '${elem.parentNode.getAttribute('name')}' and has '${elem.getAttribute('name')}' as power`);
  }
}, 500);

document.querySelector('#send-ce').onclick = () => addCE(document.querySelector('#last-instruction').value);
document.querySelector('#update-lights').onclick = updateBulbs;
document.querySelector('#listen').onclick = () => {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-GB';
  recognition.onresult = (event) => {
    if (event.results.length && event.results[0].length){
      const text = event.results[0][0].transcript.toLowerCase();
      document.querySelector('#speech-area').value = text;
      let bulb = null;
      for (const check of node.getInstances('hue bulb')){
        if (text.indexOf(check.name.toLowerCase()) > -1){
          bulb = check;
          break;
        }
      }
      if (bulb){
        let ce = `there is an iot card named {uid} that is to the agent House and has 'instruction' as content and targets the hue bulb '${bulb.name}'`;
        if (text.indexOf('turn on') > -1) ce += ' and has \'on\' as power';
        if (text.indexOf('turn off') > -1) ce += ' and has \'off\' as power';
        if (text.indexOf('brightness to') > -1) ce += ' and has \'' + text.match(/brightness to ([0-9]+)/i)[1] + '\' as brightness';
        addCE(ce);
      }
    }
  }
  recognition.start();
};
