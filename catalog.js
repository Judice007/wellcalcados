window.WELL_PRODUCTS = [
  { brand:'Nike', name:'Nike ZoomX preto', sizes:[36,37], note:'', price:170, image:'img/produto-zoomx-preto.jpg' },
  { brand:'Nike', name:'Nike ZoomX bege/prata', sizes:[40], note:'', price:150, image:'img/produto-zoomx-bege-prata.jpg' },
  { brand:'Nike', name:'Nike ZoomX Invincible azul', sizes:[40,41], note:'', price:150, image:'img/produto-zoomx-invincible-azul.jpg' },
  { brand:'Nike', name:'Nike Air Force 1 preto', sizes:[39,41], note:'', price:250, image:'img/produto-af1-preto.jpg' },
  { brand:'Nike', name:'Nike Air Force 1 branco', sizes:[37,41], note:'cadarços extras', price:250, image:'img/produto-af1-branco.jpg' },
  { brand:'Nike', name:'Nike Air Force 1 cinza', sizes:[41,43], note:'', price:250, image:'img/produto-af1-cinza.jpg' },
  { brand:'Nike', name:'Nike Air Force 1 bege/rosa', sizes:[36], note:'2 cadarços', price:250, image:'img/produto-af1-bege-rosa.jpg' },
  { brand:'Nike', name:'Nike AF1 Shadow azul/rosa', sizes:[37], note:'', price:250, image:'img/produto-af1-shadow-azul-rosa.jpg' },
  { brand:'Nike', name:'Nike Air Force 1 preto/branco', sizes:[38], note:'', price:250, image:'img/produto-af1-panda.jpg' },
  { brand:'Nike', name:'Nike AF1 plataforma azul', sizes:[36,37], note:'', price:250, image:'img/produto-af1-jester-azul.jpg' },
  { brand:'Nike', name:'Nike Court branco/azul', sizes:[37,39], note:'2 cadarços', price:250, image:'img/produto-nike-court.jpg' },
  { brand:'Adidas', name:'Adidas Samba', sizes:[37], note:'2 cadarços', price:170, image:'img/produto-adidas-samba.jpg' },
  { brand:'Adidas', name:'Adidas SL72 areia', sizes:[37], note:'2 cadarços', price:250, image:'img/produto-adidas-sl72-areia.jpg' },
  { brand:'Adidas', name:'Adidas SL72 bordô', sizes:[38], note:'feminino', price:250, image:'img/produto-adidas-sl72-bordo.jpg' },
  { brand:'Adidas', name:'Adidas feminino branco', sizes:[37,39], note:'', price:170, image:'img/produto-adidas-feminino-branco.jpg' },
  { brand:'On Cloud', name:'On Cloud preto', sizes:[36,37], note:'', price:null, image:'img/produto-on-cloud-preto.jpg' },
  { brand:'Nike', name:'Nike Air Max Plus (TN)', sizes:[], note:'holográfico', price:null, image:'img/produto-air-max-plus-tn.jpg' },
  { brand:'Nike', name:'Chuteira Nike laranja', sizes:[], note:'Campo · somente por encomenda', price:null, image:'img/chuteira-nike-laranja-campo.webp', category:'Chuteiras', orderOnly:true },
  { brand:'Nike', name:'Chuteira Nike cinza', sizes:[], note:'Campo · somente por encomenda', price:null, image:'img/chuteira-nike-cinza-campo.webp', category:'Chuteiras', orderOnly:true },
  { brand:'Adidas', name:'Chuteira Adidas branca e laranja', sizes:[], note:'Campo · somente por encomenda', price:null, image:'img/chuteira-adidas-branca-laranja-campo.webp', category:'Chuteiras', orderOnly:true },
  { brand:'Adidas', name:'Chuteira Adidas branca e verde', sizes:[], note:'Campo · somente por encomenda', price:null, image:'img/chuteira-adidas-branca-verde-campo.webp', category:'Chuteiras', orderOnly:true },
  { brand:'Adidas', name:'Chuteira Adidas preta', sizes:[], note:'Society · somente por encomenda', price:null, image:'img/chuteira-adidas-preta-society.webp', category:'Chuteiras', orderOnly:true },
  { brand:'Nike', name:'Chuteira Nike azul', sizes:[], note:'Society · somente por encomenda', price:null, image:'img/chuteira-nike-azul-society.webp', category:'Chuteiras', orderOnly:true },
  { brand:'Nike', name:'Chuteira Nike cinza society', sizes:[], note:'Society · somente por encomenda', price:null, image:'img/chuteira-nike-cinza-society.webp', category:'Chuteiras', orderOnly:true },
  { brand:'Nike', name:'Chuteira Nike branca e laranja', sizes:[], note:'Society · somente por encomenda', price:null, image:'img/chuteira-nike-branca-laranja-society.webp', category:'Chuteiras', orderOnly:true },
  { brand:'Nike', name:'Chuteira Nike rosa', sizes:[], note:'Society · somente por encomenda', price:null, image:'img/chuteira-nike-rosa-society.webp', category:'Chuteiras', orderOnly:true }
];

window.copyProductAndOpenDirect = async function(productName, sizeText, orderOnly = false) {
  const message = orderOnly
    ? `Olá! Tenho interesse em encomendar a ${productName}. Pode me passar os tamanhos disponíveis, valor e prazo?`
    : `Olá! Tenho interesse no ${productName}${sizeText ? `, tamanho ${sizeText}` : ''}. Pode me passar mais informações?`;
  window.open(`https://wa.me/5524999485839?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  try { await navigator.clipboard.writeText(message); } catch (_) {}
  return message;
};
