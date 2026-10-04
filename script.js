(function(){
  var $ = function(s,c){return (c||document).querySelector(s)};
  var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* Year */
  $('#yr').textContent = new Date().getFullYear();

  /* Mobile menu */
  var burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', function(){
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.textContent = open ? '✕' : '☰';
  });
  $$('#menu a').forEach(function(a){a.addEventListener('click', function(){
    menu.classList.remove('open'); burger.setAttribute('aria-expanded','false'); burger.textContent='☰';
  })});

  /* Theme toggle (kept in memory; storage is optional and guarded) */
  var root = document.documentElement;
  try{ var saved = localStorage.getItem('nb-theme'); if(saved) root.setAttribute('data-theme', saved); }catch(e){}
  $('#themeBtn').addEventListener('click', function(){
    var cur = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{ localStorage.setItem('nb-theme', next); }catch(e){}
  });

  /* Typing headline */
  var words = ['and sell.','and rank.','and last.','and scale.'];
  var typed = $('#typed'), wi = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce){
    setInterval(function(){
      wi = (wi+1) % words.length;
      var w = words[wi], i = 0;
      var t = setInterval(function(){
        i++; typed.textContent = w.slice(0,i);
        if(i >= w.length) clearInterval(t);
      }, 55);
    }, 3200);
  }

  /* Live style demo */
  var state = {color:'#2f4bff', ink:'#ffffff', font:'sans', radius:12};
  var fonts = {
    sans:{css:'system-ui, sans-serif', label:'system-ui'},
    serif:{css:'Georgia, "Times New Roman", serif', label:'Georgia'},
    mono:{css:'ui-monospace, Menlo, monospace', label:'ui-monospace'}
  };
  var code = $('#code'), prev = $('#preview');
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
  function render(){
    var r = state.radius === 999 ? '999px' : state.radius + 'px';
    code.innerHTML =
      '<span class="c">/* your brand, in four lines */</span>\n' +
      '<span class="k">:root</span> {\n' +
      '  <span class="k">--accent</span>: <span class="v">' + state.color + '</span>;\n' +
      '  <span class="k">--font</span>: <span class="v">' + esc(fonts[state.font].label) + '</span>;\n' +
      '  <span class="k">--radius</span>: <span class="v">' + r + '</span>;\n}';
    prev.style.setProperty('--p-accent', state.color);
    prev.style.setProperty('--p-accent-ink', state.ink);
    prev.style.setProperty('--p-font', fonts[state.font].css);
    prev.style.setProperty('--p-radius', r);
  }
  function press(group, btn){
    $$('button', group).forEach(function(b){b.setAttribute('aria-pressed', b === btn)});
  }
  $$('.chip').forEach(function(b){b.addEventListener('click', function(){
    state.color = b.dataset.color; state.ink = b.dataset.ink || '#ffffff';
    press(b.parentNode, b); render();
  })});
  $$('[data-font]').forEach(function(b){b.addEventListener('click', function(){
    state.font = b.dataset.font; press(b.parentNode, b); render();
  })});
  $$('[data-radius]').forEach(function(b){b.addEventListener('click', function(){
    state.radius = +b.dataset.radius; press(b.parentNode, b); render();
  })});
  render();

  /* Lighthouse gauges fill when visible */
  var gauges = $$('.fg');
  function fill(){
    gauges.forEach(function(c){
      var s = +c.dataset.score;
      c.style.strokeDashoffset = 226 - (226 * s / 100);
    });
  }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(en){
      if(en[0].isIntersecting){ fill(); io.disconnect(); }
    }, {threshold:.4});
    io.observe($('#perf'));
  } else { fill(); }

  /* Project filter */
  var fbtns = $$('.filters button'), cases = $$('.case');
  fbtns.forEach(function(b){b.addEventListener('click', function(){
    fbtns.forEach(function(x){x.setAttribute('aria-pressed', x === b)});
    cases.forEach(function(c){
      c.hidden = !(b.dataset.filter === 'all' || c.dataset.cat === b.dataset.filter);
    });
  })});

  /* Plan buttons prefill the form */
  $$('[data-plan]').forEach(function(a){a.addEventListener('click', function(){
    var m = $('#msg');
    if(!m.value) m.value = 'I am interested in the ' + a.dataset.plan + ' package. ';
  })});

  /* Form validation */
  var form = $('#form'), result = $('#result');
  function setErr(id, input, msg){
    $('#e-' + id).textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var n = $('#name'), em = $('#email'), m = $('#msg');
    var ok = true;
    ok = setErr('name', n, n.value.trim().length < 2 ? 'Enter your name.' : '') && ok;
    ok = setErr('email', em, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim()) ? '' : 'Enter a valid email address, like name@company.com.') && ok;
    ok = setErr('msg', m, m.value.trim().length < 15 ? 'Add a sentence or two about your project (at least 15 characters).' : '') && ok;
    if(!ok){ var first = $('[aria-invalid="true"]', form); if(first) first.focus(); return; }
    result.innerHTML = '<div class="ok"><b>Thanks, ' + esc(n.value.trim().split(' ')[0]) + '.</b> We have your details and will reply to ' + esc(em.value.trim()) + ' within one working day.</div>';
    form.reset();
  });
})();
