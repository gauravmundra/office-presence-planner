/*!
 * Time Card — Office Presence Planner
 * Application logic
 *
 * Author: Gaurav Mundra
 * Repo:   Office Presence Planner
 * License: MIT
 *
 * Given a weekly hour requirement and a number of required office days,
 * this figures out how long to stay today (and on each remaining day)
 * to stay on pace, and renders it as a "departure board" + punch card.
 */

(function officePresencePlanner(){
  'use strict';

  // Author: Gaurav Mundra
  const AUTHOR = 'Gaurav Mundra';

  const $ = id => document.getElementById(id);
  const STORE_KEY = 'officePresencePlannerState';

  function fmtHours(decimal){
    decimal = Math.max(0, decimal);
    const total = Math.round(decimal * 60);
    const h = Math.floor(total/60), m = total % 60;
    return `${h}h ${String(m).padStart(2,'0')}m`;
  }
  function fmtTime(value){
    const [hh,mm] = value.split(':').map(Number);
    return new Date(2000,0,1,hh,mm).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
  }
  function addHours(time, hours){
    const [hh,mm] = time.split(':').map(Number);
    const d = new Date(2000,0,1,hh,mm);
    d.setMinutes(d.getMinutes() + Math.round(hours*60));
    return d.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
  }

  // --- Local persistence (best-effort; falls back to in-memory silently) ---
  let memoryState = null;
  function saveState(){
    const selected = document.querySelector('input[name="todayDay"]:checked');
    const state = {
      required: $('required').value,
      days: $('days').value,
      selectedDay: selected ? selected.value : '1',
      completed: $('completed').value,
      time: $('time').value
    };
    memoryState = state;
    try{
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      const note = $('saveNote');
      note.classList.add('show');
      clearTimeout(saveState._t);
      saveState._t = setTimeout(() => note.classList.remove('show'), 1600);
    }catch(e){ /* storage unavailable — state still kept in memory for this session */ }
  }
  function loadState(){
    try{
      const raw = localStorage.getItem(STORE_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){ /* ignore */ }
    return memoryState;
  }

  let lastDayCount = 0;

  function buildPills(days, selected){
    let html = '';
    for(let i=1;i<=days;i++){
      const ord = i===1?'1st':i===2?'2nd':i===3?'3rd':`${i}th`;
      html += `<div class="pill">
        <input type="radio" name="todayDay" id="pd${i}" value="${i}" ${i===selected?'checked':''}>
        <label for="pd${i}">${ord}</label>
      </div>`;
    }
    $('dayPills').innerHTML = html;
    document.querySelectorAll('input[name="todayDay"]').forEach(el => el.addEventListener('change', calculate));
  }

  let lastExitText = null;

  function calculate(){
    const required = parseFloat($('required').value) || 0;
    let days = parseInt($('days').value) || 1;
    days = Math.max(1, Math.min(7, days));

    let selected = document.querySelector('input[name="todayDay"]:checked');
    let selectedDay = selected ? parseInt(selected.value) : 1;

    if(days !== lastDayCount){
      selectedDay = Math.min(selectedDay, days);
      buildPills(days, selectedDay);
      lastDayCount = days;
      selected = document.querySelector('input[name="todayDay"]:checked');
    }

    const isDay1 = selectedDay === 1;
    $('completed').disabled = isDay1;
    $('completedLabel').firstChild.textContent = isDay1
      ? 'Hours completed so far '
      : `Hours completed through day ${selectedDay - 1} `;

    const completed = isDay1 ? 0 : Math.max(0, parseFloat($('completed').value) || 0);
    const inTime = $('time').value || '09:00';

    const remaining = Math.max(0, required - completed);
    const daysLeft = Math.max(1, days - selectedDay + 1);
    const today = remaining / daysLeft;

    $('reqOut').textContent = fmtHours(required);
    $('doneOut').textContent = fmtHours(completed);
    $('remainOut').textContent = fmtHours(remaining);

    const timeEl = $('exitTime');
    const noteEl = $('exitNote');
    let newText;

    if(remaining <= 0){
      newText = 'DONE';
      timeEl.textContent = newText;
      timeEl.classList.add('done');
      noteEl.innerHTML = '<b>Requirement already covered</b> — clock out whenever you like.';
    } else {
      timeEl.classList.remove('done');
      newText = addHours(inTime, today);
      timeEl.textContent = newText;
      noteEl.innerHTML = `In at <b>${fmtTime(inTime)}</b> · put in <b>${fmtHours(today)}</b> today to stay on track.`;
    }

    if(newText !== lastExitText){
      timeEl.classList.remove('flip');
      void timeEl.offsetWidth;
      timeEl.classList.add('flip');
      lastExitText = newText;
    }

    let cardHtml = '';
    for(let i=1;i<=days;i++){
      let cls = 'upcoming', tag = 'left';
      if(i < selectedDay){ cls='done'; tag='done'; }
      else if(i === selectedDay){ cls='today'; tag='today'; }
      const mark = i < selectedDay ? '✓' : i;
      cardHtml += `<div class="hole ${cls}"><div class="circle">${mark}</div><div class="tag">${tag}</div></div>`;
    }
    $('punchcard').innerHTML = cardHtml;

    saveState();
  }

  function init(){
    ['required','days','completed','time'].forEach(id => $(id).addEventListener('input', calculate));

    // restore last session, then fall back to defaults
    const saved = loadState();
    if(saved){
      if(saved.required) $('required').value = saved.required;
      if(saved.days) $('days').value = saved.days;
      if(saved.completed !== undefined) $('completed').value = saved.completed;
      if(saved.time) $('time').value = saved.time;
      const days = Math.max(1, Math.min(7, parseInt(saved.days) || 3));
      const selectedDay = Math.max(1, Math.min(days, parseInt(saved.selectedDay) || 2));
      buildPills(days, selectedDay);
      lastDayCount = days;
    } else {
      buildPills(3, 2);
      lastDayCount = 3;
    }
    calculate();

    // eslint-disable-next-line no-console
    console.log(`Time Card — Office Presence Planner\nCreated by ${AUTHOR}`);
  }

  document.addEventListener('DOMContentLoaded', init);
})();

// Time Card — Office Presence Planner — © Gaurav Mundra
