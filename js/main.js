var WA = "https://wa.me/5548996628811?text=";
var PADRAO = "Olá! Vi o site da SmartPlanet e quero fazer um pedido.";
var CONVERSAO = "AW-XXXXXXXXXX/ROTULO";

function q(sel) {
  return document.querySelectorAll(sel);
}

function marcar(sel, msg) {
  q(sel).forEach(function (el) {
    if (!el.dataset.msg) el.dataset.msg = msg;
  });
}

function abrir(msg) {
  var a = document.createElement("a");
  a.href = WA + encodeURIComponent(msg);
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

(function () {
  var video = document.querySelector(".topo-video");
  if (!video) return;
  var fonte = video.querySelector("source");
  var trilha = new Audio(fonte ? fonte.src : video.currentSrc);
  trilha.loop = true;
  trilha.preload = "auto";
  trilha.volume = 1;

  video.controls = false;
  video.loop = true;
  video.removeAttribute("muted");
  video.defaultMuted = false;
  video.muted = false;
  video.volume = 1;
  video.disablePictureInPicture = true;
  video.setAttribute("controlslist", "nodownload nofullscreen noremoteplayback noplaybackrate");
  video.playsInline = true;
  video.autoplay = true;

  var ultimoTempo = -1;
  var parado = 0;
  var videoMudo = false;

  function encaixar() {
    if (!video.videoWidth || !video.videoHeight) return;
    video.style.aspectRatio = video.videoWidth + " / " + video.videoHeight;
  }

  function somNoVideo() {
    video.removeAttribute("muted");
    video.defaultMuted = false;
    video.muted = false;
    video.volume = 1;
    videoMudo = false;
    trilha.pause();
  }

  function tocarTrilha() {
    if (video.readyState >= 1 && isFinite(video.currentTime)) {
      try { trilha.currentTime = video.currentTime; } catch (e) {}
    }
    trilha.volume = 1;
    trilha.muted = false;
    var promessa = trilha.play();
    if (promessa && promessa.catch) promessa.catch(function () {});
  }

  function tocar() {
    somNoVideo();
    var promessa = video.play();
    if (!promessa || !promessa.then) return;
    promessa.then(function () {
      somNoVideo();
    }).catch(function (erro) {
      if (erro && erro.name === "AbortError") return;
      video.muted = true;
      video.defaultMuted = true;
      videoMudo = true;
      var segunda = video.play();
      if (segunda && segunda.catch) segunda.catch(function () {});
      tocarTrilha();
    });
  }

  video.addEventListener("loadedmetadata", encaixar);
  video.addEventListener("playing", function () {
    video.hidden = false;
    encaixar();
    if (!videoMudo) somNoVideo();
  });
  video.addEventListener("timeupdate", function () {
    if (!videoMudo || trilha.paused) return;
    if (Math.abs(trilha.currentTime - video.currentTime) > 0.35) {
      try { trilha.currentTime = video.currentTime; } catch (e) {}
    }
  });
  video.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
  video.addEventListener("ended", function () {
    video.currentTime = 0;
    if (videoMudo) trilha.currentTime = 0;
    tocar();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) return;
    if (video.paused) tocar();
    else if (videoMudo && trilha.paused) tocarTrilha();
  });

  function liberar() {
    if (!video.muted && !videoMudo) return;
    somNoVideo();
    var promessa = video.play();
    if (promessa && promessa.catch) promessa.catch(function () {});
  }

  ["pointerdown", "touchstart", "keydown"].forEach(function (tipo) {
    document.addEventListener(tipo, liberar, true);
  });

  setInterval(function () {
    if (video.paused || video.ended) {
      tocar();
      return;
    }
    if (!videoMudo && video.muted) somNoVideo();
    if (videoMudo && trilha.paused) tocarTrilha();
    if (!isFinite(video.duration)) return;
    if (Math.abs(video.currentTime - ultimoTempo) < 0.01 && video.readyState < 3) {
      parado += 1;
      if (parado >= 3) tocar();
    } else {
      parado = 0;
    }
    ultimoTempo = video.currentTime;
  }, 700);

  encaixar();
  tocar();
})();

q(".grade .preco").forEach(function (p) {
  var texto = p.textContent.trim();
  var bruto = parseFloat(texto.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
  var novo = "R$ " + (Math.round(bruto * 0.85 * 100) / 100).toFixed(2).replace(".", ",");
  p.textContent = "";
  var linha = document.createElement("span");
  linha.className = "valores";
  var de = document.createElement("span");
  de.className = "valor de";
  de.textContent = texto;
  var por = document.createElement("span");
  por.className = "valor por";
  por.textContent = novo;
  linha.appendChild(de);
  linha.appendChild(por);
  var dica = document.createElement("span");
  dica.className = "dica";
  dica.setAttribute("aria-hidden", "true");
  dica.textContent = "ver preço";
  p.appendChild(linha);
  p.appendChild(dica);
  p.tabIndex = 0;
  p.setAttribute("role", "button");
  p.setAttribute("aria-pressed", "false");
  p.setAttribute("aria-label", "De " + texto + " por " + novo);
  var botao = p.closest(".card") && p.closest(".card").querySelector("[data-msg]");
  if (botao) botao.dataset.msg = botao.dataset.msg.replace(/R\$\s*[\d.,]+/, novo);
});

function copiarPreco(card, preco) {
  var origem = card.querySelector(".valores");
  if (!origem || !preco) return;
  var alvo = preco.querySelector(".valores");
  if (!alvo) {
    alvo = document.createElement("span");
    alvo.className = "valores";
    var antigo = preco.querySelector(".valor");
    if (antigo) antigo.remove();
    preco.insertBefore(alvo, preco.firstChild);
  }
  alvo.innerHTML = origem.innerHTML;
}

function revelarPreco(p) {
  var aberto = p.classList.toggle("aberto");
  p.setAttribute("aria-pressed", aberto ? "true" : "false");
}

document.addEventListener("click", function (e) {
  var preco = e.target.closest && e.target.closest(".preco");
  if (!preco) return;
  e.preventDefault();
  e.stopPropagation();
  if (preco.closest(".folha")) {
    revelarPreco(preco);
    return;
  }
  var card = preco.closest(".card");
  var pedido = card && card.closest("li") && card.closest("li").dataset.pedido;
  var botao = card && card.querySelector("[data-msg]");
  abrir(pedido || (botao && botao.dataset.msg) || PADRAO);
}, true);

document.addEventListener("keydown", function (e) {
  var preco = e.target.closest && e.target.closest(".preco");
  if (!preco) return;
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  e.stopPropagation();
  revelarPreco(preco);
}, true);

marcar(".logo, .topo h1, .topo .sub, .resumo", PADRAO);
marcar(".faixa", "Olá! Vi o site da SmartPlanet e quero fazer um pedido com entrega.");
marcar(".extra, .rail-t", "Olá! Vi no site e quero saber sobre outros acessórios.");
marcar(".galeria .peca", "Olá! Vi no site e quero saber sobre esse acessório.");
marcar(".pausa", "Olá! Vi o site da SmartPlanet e quero fazer um pedido.");

var titulos = [
  PADRAO,
  "Olá! Vi o site da SmartPlanet e quero saber como funciona o pedido.",
  PADRAO,
  PADRAO,
  PADRAO
];

q("main h2").forEach(function (el, i) {
  el.dataset.msg = titulos[i] || PADRAO;
});

var passos = [
  "Olá! Vi o site da SmartPlanet e quero fazer um pedido.",
  "Olá! Vi o site e quero confirmar o modelo e o valor de um produto.",
  "Olá! Vi o site e quero receber em casa ou retirar na loja."
];

q(".passos li").forEach(function (el, i) {
  el.dataset.msg = passos[i] || PADRAO;
});

var motivos = [
  "Olá! Vi o site da SmartPlanet e quero fazer um pedido.",
  "Olá! Vi o site e quero receber em até 4 horas. Preciso de:",
  PADRAO
];

q(".motivos p").forEach(function (el, i) {
  el.dataset.msg = motivos[i] || PADRAO;
});

marcar(".loja-fotos .foto", PADRAO);

q("[data-msg]").forEach(function (el) {
  if (el.tagName === "A") {
    el.href = WA + encodeURIComponent(el.dataset.msg);
    el.target = "_blank";
    el.rel = "noopener";
  } else if (!/^(H1|H2|H3|P|SPAN)$/.test(el.tagName)) {
    el.setAttribute("role", "link");
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
  }
});

document.addEventListener("click", function (e) {
  var el = e.target.closest("[data-msg]");
  if (!el) return;
  if (typeof gtag === "function") {
    gtag("event", "conversion", { send_to: CONVERSAO });
  }
  if (el.tagName !== "A") abrir(el.dataset.msg);
});

document.addEventListener("keydown", function (e) {
  var el = e.target;
  if ((e.key === "Enter" || e.key === " ") && el.dataset && el.dataset.msg && el.tagName !== "A") {
    e.preventDefault();
    el.click();
  }
});

(function () {
  var reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var raiz = document.documentElement;
  if (reduzido) return;

  var faixa = document.querySelector(".faixa");
  if (faixa) {
    var texto = faixa.textContent.trim();
    var trilho = document.createElement("div");
    trilho.className = "trilho";
    for (var i = 0; i < 6; i++) {
      var item = document.createElement("span");
      item.textContent = texto;
      if (i) item.setAttribute("aria-hidden", "true");
      trilho.appendChild(item);
    }
    faixa.textContent = "";
    faixa.appendChild(trilho);
  }

  var poeira = document.createElement("div");
  poeira.className = "poeira";
  poeira.setAttribute("aria-hidden", "true");
  for (var k = 0; k < 14; k++) {
    var ponto = document.createElement("i");
    var tamanho = 2 + Math.random() * 3;
    ponto.style.cssText =
      "left:" + (Math.random() * 100) +
      "%;width:" + tamanho + "px;height:" + tamanho +
      "px;animation-duration:" + (16 + Math.random() * 16) +
      "s;animation-delay:-" + (Math.random() * 30) +
      "s;--dx:" + ((Math.random() - 0.5) * 80) + "px";
    poeira.appendChild(ponto);
  }
  document.body.insertBefore(poeira, document.body.firstChild.nextSibling);

  var comum = ".topo .sub,.topo .btn,main h2,.resumo,.grade .card,.extra,.rail-t,.rail,.passos li,.motivos p,.endereco,.mapa,#loja .btn,.final .btn";
  var portais = ".topo > .foto,.loja-fotos .foto";
  var blocos = [].slice.call(document.querySelectorAll(comum + "," + portais));
  var observador = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("on");
            observador.unobserve(entrada.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" })
    : null;

  blocos.forEach(function (el) {
    el.classList.add(el.matches(portais) ? "portal" : "rv");
    var ordem = [].indexOf.call(el.parentNode.children, el);
    el.style.setProperty("--d", Math.min(ordem, 5) * 0.09 + "s");
    if (observador) observador.observe(el);
    else el.classList.add("on");
  });

  var primeiroMotivo = document.querySelector(".motivos p");
  if (primeiroMotivo && /^13 /.test(primeiroMotivo.textContent)) {
    primeiroMotivo.innerHTML = primeiroMotivo.innerHTML.replace("13", '<b class="cont">0</b>');
    var contador = primeiroMotivo.querySelector(".cont");
    new IntersectionObserver(function (entradas, obs) {
      if (!entradas[0].isIntersecting) return;
      obs.disconnect();
      var inicio = performance.now();
      (function passo(agora) {
        var progresso = Math.min((agora - inicio) / 1400, 1);
        contador.textContent = Math.round(13 * (1 - Math.pow(1 - progresso, 3)));
        if (progresso < 1) requestAnimationFrame(passo);
      })(inicio);
    }, { threshold: 0.6 }).observe(contador);
  }

  var barra = document.querySelector(".progresso");
  var fotoTopo = document.querySelector(".topo > .foto img");
  var agendado = false;

  function aoRolar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function () {
      agendado = false;
      var y = scrollY;
      var altura = raiz.scrollHeight - innerHeight;
      barra.style.setProperty("--p", altura > 0 ? y / altura : 0);
      if (fotoTopo) fotoTopo.style.setProperty("--py", (-Math.min(y, 360) * 0.05) + "px");
    });
  }

  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  function luz(e) {
    var card = e.target.closest && e.target.closest(".card");
    if (!card) return;
    var caixa = card.getBoundingClientRect();
    var px = (e.clientX - caixa.left) / caixa.width - 0.5;
    var py = (e.clientY - caixa.top) / caixa.height - 0.5;
    card.style.setProperty("--mx", (e.clientX - caixa.left) + "px");
    card.style.setProperty("--my", (e.clientY - caixa.top) + "px");
    card.style.setProperty("--rx", (px * 7).toFixed(2) + "deg");
    card.style.setProperty("--ry", (py * -5).toFixed(2) + "deg");
    if (e.type === "pointerdown") {
      card.classList.add("toque");
      setTimeout(function () {
        card.classList.remove("toque");
      }, 700);
    }
  }

  document.documentElement.classList.add("inclina");

  document.addEventListener("pointermove", luz, { passive: true });
  document.addEventListener("pointerdown", luz, { passive: true });

  function auto(el, ms) {
    var visivel = false;
    var pausa = 0;
    new IntersectionObserver(function (e) {
      visivel = e[0].isIntersecting;
    }).observe(el);
    ["pointerdown", "touchstart", "wheel"].forEach(function (evento) {
      el.addEventListener(evento, function () {
        pausa = Date.now() + 7000;
      }, { passive: true });
    });
    setInterval(function () {
      if (!visivel || Date.now() < pausa || el.scrollWidth <= el.clientWidth + 8 || !el.children[0]) return;
      var espaco = parseFloat(getComputedStyle(el).columnGap) || 0;
      var largura = el.children[0].getBoundingClientRect().width + espaco;
      var fim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 6;
      el.scrollTo({ left: fim ? 0 : el.scrollLeft + largura, behavior: "smooth" });
    }, ms);
  }

  document.querySelectorAll(".carrossel").forEach(function (c) {
    auto(c, 2800 + Math.random() * 1200);
  });

  var rail = document.querySelector(".rail");
  if (rail) auto(rail, 2400);

  setTimeout(function () {
    var balao = document.createElement("a");
    balao.className = "balao";
    balao.dataset.msg = PADRAO;
    balao.href = WA + encodeURIComponent(PADRAO);
    balao.target = "_blank";
    balao.rel = "noopener";
    balao.textContent = "Atendimento na hora pelo WhatsApp";
    document.body.appendChild(balao);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        balao.classList.add("on");
      });
    });
    setTimeout(function () {
      balao.classList.remove("on");
      setTimeout(function () {
        balao.remove();
      }, 600);
    }, 8000);
  }, 9000);
})();

(function () {
  var folha = document.getElementById("folha");
  var grades = document.querySelectorAll("#produtos .grade");
  if (!grades.length || !folha) return;

  function numero(li) {
    var valor = li.querySelector(".por") || li.querySelector(".valor");
    var texto = valor ? valor.textContent : "";
    return parseFloat(texto.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
  }

  function categoria(nome) {
    var n = nome.toLowerCase();
    if (n.indexOf("controle") >= 0) return "controles";
    if (n.indexOf("fone") >= 0) return "fones";
    if (n.indexOf("power bank") >= 0) return "power";
    if (n.indexOf("cabo") >= 0) return "cabos";
    if (n.indexOf("veicular") >= 0 || n.indexOf("suporte") >= 0 || n.indexOf("moto") >= 0) return "carro";
    if (n.indexOf("carregador") >= 0 || n.indexOf("adaptador") >= 0) return "energia";
    return "outros";
  }

  var itens = [];
  grades.forEach(function (grade) {
    [].slice.call(grade.children).forEach(function (li) {
      if (li.nodeType !== 1 || !li.querySelector(".card")) return;
      itens.push(li);
    });
  });

  itens.forEach(function (li, i) {
    var card = li.querySelector(".card");
    var nome = card.querySelector("h3").textContent.trim();
    var pedido = card.querySelector("[data-msg]");
    li.dataset.cat = categoria(nome);
    li.dataset.nome = nome;
    li.dataset.preco = String(numero(li));
    li.dataset.ordem = String(i);
    li.dataset.pedido = pedido ? pedido.dataset.msg : PADRAO;
    var info = card.querySelector(".info");
    var ver = document.createElement("button");
    ver.type = "button";
    ver.className = "detalhe";
    ver.textContent = "Ver produto";
    info.insertBefore(ver, info.querySelector(".btn"));
    ver.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      abrirFolha(li);
    });
    card.addEventListener("click", function (e) {
      if (e.target.closest(".detalhe, a, .preco")) return;
      abrir(li.dataset.pedido || PADRAO);
    });
  });

  var cat = "todos";
  var texto = "";
  var ordem = "loja";

  function combina(li) {
    var q = texto.trim().toLowerCase();
    var naCategoria = cat === "todos" || li.dataset.cat === cat;
    var noTexto = !q || li.dataset.nome.toLowerCase().indexOf(q) >= 0;
    return naCategoria && noTexto;
  }

  function ordenar(a, b) {
    if (ordem === "menor") return Number(a.dataset.preco) - Number(b.dataset.preco);
    if (ordem === "maior") return Number(b.dataset.preco) - Number(a.dataset.preco);
    if (ordem === "az") return a.dataset.nome.localeCompare(b.dataset.nome, "pt");
    return Number(a.dataset.ordem) - Number(b.dataset.ordem);
  }

  function aplicar() {
    var vistos = 0;
    grades.forEach(function (grade) {
      var lista = [].slice.call(grade.children).filter(function (li) {
        return li.nodeType === 1 && li.querySelector;
      });
      lista.sort(ordenar);
      var algum = false;
      lista.forEach(function (li) {
        var ok = combina(li);
        li.hidden = !ok;
        if (ok) {
          algum = true;
          vistos++;
        }
        grade.appendChild(li);
      });
      var bloco = grade.closest(".bloco");
      if (bloco) bloco.hidden = !algum;
    });
    document.querySelectorAll("#produtos .pausa").forEach(function (pausa) {
      function blocoPerto(inicio, passo) {
        var el = inicio;
        while (el) {
          if (el.classList.contains("pausa")) return false;
          if (el.classList.contains("bloco")) return !el.hidden;
          el = el[passo];
        }
        return false;
      }
      var mostraAntes = blocoPerto(pausa.previousElementSibling, "previousElementSibling");
      var mostraDepois = blocoPerto(pausa.nextElementSibling, "nextElementSibling");
      pausa.hidden = !(mostraAntes && mostraDepois);
    });
    var galeria = document.querySelector(".galeria");
    if (galeria) galeria.hidden = cat !== "todos" || texto.trim() !== "";
    document.getElementById("contagem").textContent = vistos + (vistos === 1 ? " produto" : " produtos");
    document.getElementById("vazio").hidden = vistos !== 0;
  }

  q(".chip").forEach(function (b) {
    b.setAttribute("aria-pressed", b.classList.contains("on") ? "true" : "false");
    b.addEventListener("click", function () {
      cat = b.dataset.cat;
      q(".chip").forEach(function (c) {
        var on = c === b;
        c.classList.toggle("on", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      aplicar();
    });
  });

  document.getElementById("busca").addEventListener("input", function (e) {
    texto = e.target.value;
    aplicar();
  });

  document.getElementById("ordem").addEventListener("change", function (e) {
    ordem = e.target.value;
    aplicar();
  });

  function mostrarFolha(alvo) {
    var y = window.scrollY;
    if (typeof alvo.showModal === "function") alvo.showModal();
    window.scrollTo(0, y);
    var fecha = alvo.querySelector("[data-fecha]");
    if (fecha && fecha.focus) fecha.focus({ preventScroll: true });
    window.scrollTo(0, y);
  }

  function abrirFolha(li) {
    var card = li.classList && li.classList.contains("card") ? li : li.querySelector(".card");
    if (!card) return;
    var img = card.querySelector("img");
    var destino = folha.querySelector("img");
    destino.src = img.currentSrc || img.src;
    destino.alt = img.alt;
    folha.querySelector("#folha-nome").textContent = card.querySelector("h3").textContent.trim();
    var preco = folha.querySelector(".preco");
    preco.classList.remove("aberto");
    preco.setAttribute("aria-pressed", "false");
    copiarPreco(card, preco);
    var pedido = li.dataset && li.dataset.pedido;
    var botao = card.querySelector("[data-msg]");
    if (!pedido && botao) pedido = botao.dataset.msg;
    var link = folha.querySelector("a.btn");
    link.dataset.msg = pedido || PADRAO;
    link.href = WA + encodeURIComponent(link.dataset.msg);
    link.target = "_blank";
    link.rel = "noopener";
    mostrarFolha(folha);
  }

  folha.querySelector("[data-fecha]").addEventListener("click", function () {
    folha.close();
  });

  folha.addEventListener("click", function (e) {
    if (e.target === folha) folha.close();
  });

  aplicar();
})();

(function () {
  var faixa = document.querySelector(".infinito");
  var esteira = faixa && faixa.querySelector(".esteira");
  if (!esteira) return;

  var nomes = [
    "Adaptador turbo 60W H'Maston",
    "Cabo Tipo-C 2 m Kaidi",
    "Power bank 20.000 mAh Espada",
    "Suporte moto retrovisor H'Maston",
    "Fone bluetooth Lehmox LEF-1003",
    "Controle PS4 sem fio",
    "Pen drive 32 GB Altomex",
    "Carregador veicular 55W"
  ];
  var porNome = {};
  document.querySelectorAll("#produtos .grade h3").forEach(function (h) {
    porNome[h.textContent.trim()] = h.closest("li");
  });
  var origem = nomes.map(function (nome) { return porNome[nome]; }).filter(Boolean);
  if (!origem.length) return;

  var reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pintar(oculto) {
    origem.forEach(function (li) {
      var copia = li.cloneNode(true);
      copia.querySelectorAll(".rv, .on").forEach(function (el) {
        el.classList.remove("rv", "on");
      });
      if (oculto) {
        copia.setAttribute("aria-hidden", "true");
        copia.querySelectorAll("a, button, [tabindex]").forEach(function (el) {
          el.tabIndex = -1;
        });
      }
      esteira.appendChild(copia);
    });
  }

  pintar(false);
  if (!reduzido) pintar(true);

  faixa.addEventListener("click", function (e) {
    var card = e.target.closest(".card");
    if (!card || !faixa.contains(card)) return;
    if (e.target.closest(".detalhe")) {
      e.preventDefault();
      e.stopPropagation();
      var folha = document.getElementById("folha");
      if (!folha) return;
      var img = card.querySelector("img");
      var destino = folha.querySelector("img");
      destino.src = img.currentSrc || img.src;
      destino.alt = img.alt;
      folha.querySelector("#folha-nome").textContent = card.querySelector("h3").textContent.trim();
      var preco = folha.querySelector(".preco");
      preco.classList.remove("aberto");
      preco.setAttribute("aria-pressed", "false");
      copiarPreco(card, preco);
      var botao = card.querySelector("a[data-msg]");
      var link = folha.querySelector("a.btn");
      link.dataset.msg = botao ? botao.dataset.msg : PADRAO;
      link.href = WA + encodeURIComponent(link.dataset.msg);
      link.target = "_blank";
      link.rel = "noopener";
      var y = window.scrollY;
      if (typeof folha.showModal === "function") folha.showModal();
      window.scrollTo(0, y);
      var fecha = folha.querySelector("[data-fecha]");
      if (fecha && fecha.focus) fecha.focus({ preventScroll: true });
      window.scrollTo(0, y);
      return;
    }
    if (e.target.closest("a, .preco")) return;
    var botaoCard = card.querySelector("[data-msg]");
    if (!botaoCard) return;
    e.preventDefault();
    abrir(botaoCard.dataset.msg);
  });

  faixa.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var detalhe = e.target.closest && e.target.closest(".detalhe");
    if (!detalhe || !faixa.contains(detalhe)) return;
    e.preventDefault();
    detalhe.click();
  });

  if (reduzido || !("IntersectionObserver" in window)) {
    if (!reduzido) faixa.classList.add("gira");
    return;
  }

  new IntersectionObserver(function (entradas) {
    faixa.classList.toggle("gira", entradas[0].isIntersecting);
  }, { threshold: 0.2 }).observe(faixa);
})();
