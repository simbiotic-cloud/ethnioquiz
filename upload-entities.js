const https = require('https');

function apiPost(data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request('https://ethnioquiz.com/api/entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let b = ''; res.on('data', c => b += c); res.on('end', () => resolve(b));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

function apiGet() {
  return new Promise((resolve, reject) => {
    https.get('https://ethnioquiz.com/api/entities', res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

function mkImg(id, url) { return { id, url, shownCount: 0, lastShown: null }; }

const SPAIN_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/a/ad/Goyas_2024_-_Pen%C3%A9lope_Cruz-2_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/7/7e/Javier_Bardem_Cannes_2018.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/7/72/Goyas_2025_-_Antonio_Banderas_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6c/Pedro_Almod%C3%B3var-69720_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/7/71/Rafael_Nadal_en_2024_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a1/PauCaptura.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4b/Sergio_Ramos_Interview_2021_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a5/Andr%C3%A9s_Iniesta_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f2/Gerard_Piqu%C3%A9_Euro_2012_vs_France_01.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4f/Enrique_Iglesias_2011%2C_2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f1/2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/21/Goyas_2025_-_Alejandro_Sanz_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/58/2023-11-16_Gala_de_los_Latin_Grammy%2C_12_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/ef/Julio_Iglesias09.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/d3/Elsa_Pataky_Cannes_cropped.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/07/Malaga_Film_Festival_2025_-_Mario_Casas-2_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/8/8b/Malaga_Film_Festival_2025_-_Blanca_Su%C3%A1rez_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e5/%C3%9Arsula_Corber%C3%B3-65339.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/c/ce/Formula1Gabelhofen2022_%2804%29_%28cropped2%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a6/David_Silva_2017.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/1e/Jugadors_pretemporada_pels_Estats_Units_%28cropped%292.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/13/Pedri.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/3/32/Liver-RM_%285%29_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/40/Sergio_Busquets_NYCFC_Miami_24_Sep_2025-020_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/24/Marc_M%C3%A1rquez_at_Estrella_Galicia_stand_during_2025_Dutch_TT.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/c/c8/Iker-Casillas-SportsTrade-2021-cropped.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/57/Fernando_Torres_2017.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a4/Spain-Tahiti%2C_Confederations_Cup_2013_%2802%29_%28Villa_crop%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/5b/2023_-_Cesc_Fabregas_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b6/UEFA_EURO_qualifiers_Sweden_vs_Spain_20191015_Dani_Carvajal_10_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/41/RODRI_-_SWE_vs_ESP_-_UEFA_EURO_2020_QUALIFIERS_-_2019.10.15_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/62/%C3%81lvaro_Morata_in_2025.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/1e/Ferran_Torres_2019.png',
  'https://upload.wikimedia.org/wikipedia/commons/8/8d/2020-02-06_Visita_de_los_Reyes_a_%C3%89cija_con_motivo_del_%22Premio_Escuela_del_A%C3%B1o_2019%22_de_la_Fundaci%C3%B3n_Princesa_de_Girona%2C_31_%28Queen_Letizia%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6d/Daiga_Mieri%C5%86a_tiekas_ar_Sp%C4%81nijas_karali_-_53814974005_%28cropped%29-2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4a/Pedro_S%C3%A1nchez_in_2026.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/d4/Santiago_Abascal_%2854349274173%29_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/03/Albert_Rivera_in_2019_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4b/Carolina_Mar%C3%ADn_2014_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b5/Mireia_Belmonte_%28ESP%29_2018.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/be/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Garbi%C3%B1e_Muguruza_-_240422_182821-2_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/1d/Badosa_RG21_%2814%29_%2851376409698%29_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/13/Premios_Goya_2020_-_Paz_Vega_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/23/Sara_Carbonero_2016.png',
  'https://upload.wikimedia.org/wikipedia/commons/5/52/Jordi_Alba_NE_Revolution_Inter_Miami_7.9.25-047_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e0/Dani_Olmo_2022.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/49/Marcos_Llorente_2019.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/7/7a/2015_Tour_de_France_team_presentation%2C_Alberto_Contador_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/7/79/Gemma_Mengual_Civil.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/ef/%D0%9C%D0%B0%D1%82%D1%87_%C2%AB%D0%94%D0%B8%D0%BD%D0%B0%D0%BC%D0%BE%C2%BB_-_%C2%AB%D0%91%D0%B0%D1%80%D1%81%D0%B5%D0%BB%D0%BE%D0%BD%D0%B0%C2%BB_0-1._2_%D0%BB%D0%B8%D1%81%D1%82%D0%BE%D0%BF%D0%B0%D0%B4%D0%B0_2021_%D1%80%D0%BE%D0%BA%D1%83_%E2%80%94_1289339_%28cropped%29.jpg',
];

const BASQUE_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/b/b6/Los_Caminos_del_f%C3%BAtbol._Xabi_Alonso_%2839666778464%29_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b8/Mikel_Arteta_2021_%28cropped%29.png',
  'https://upload.wikimedia.org/wikipedia/commons/a/a8/Aitor_Karanka.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/5c/Kepa.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a0/Asier_Illaramendi_-_Real_Sociedad_2016-17_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f8/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93282_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/97/SM-AB_2018_%287%29_%28Aduriz%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/1e/Joseba_etxeberria.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/7/71/Andoni_Zubizarreta_en_2013-03_-_versi%C3%B3n_ampliada_%28cropped%29.JPG',
  'https://upload.wikimedia.org/wikipedia/commons/8/89/Ainhoa_Arteta_at_the_Quincena_Musical.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/59/Elena_Anaya-60027.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/fe/FerminMuguruza.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/ba/Con_Juan_Mari_y_Elena_Arzak.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/98/Edurne_Pasaban_recibe_el_Premio_Vasco_Universal_2010_4_%28crop%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/d4/Jon_Rahm_Ryder_Cup_2025-130_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/ec/Iker_Muniain_%2815961406985%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f1/UEFA_EURO_qualifiers_Sweden_vs_Spain_20191015_108_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/ff/Gorkairaizoz.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/d5/2018_Gaizka_Mendieta.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/11/Julen_Guerrero_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/ea/SM-AB_2018_%285%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f7/Arnaldo_Otegi_2016_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/1a/Miguel_de_Unamuno_Meurisse_c_1925.JPG',
  'https://upload.wikimedia.org/wikipedia/commons/8/85/Sabino-arana-olerkijak.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f1/Abraham_Olano_%282006%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/ec/Tour_de_France_20130704_Aix-en-Provence_067.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/16/Iban_Mayo_en_el_Giro_de_Italia_2007.JPG',
  'https://upload.wikimedia.org/wikipedia/commons/0/06/Joseba_Beloki.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/44/GI220047_landa.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/c/cd/Ion_Izagirre_at_the_rider_presentation_of_Itzulia_Basque_Country_stage_3.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/51/Gorka_Izagirre_at_the_rider_presentation_of_Itzulia_Basque_Country_stage_3.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/07/Unai_Emery_-_Sevilla_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/59/Valverde_2014.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/ed/Jagoba_Arrasate_%28octubre_de_2013%29_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/19/Imanol_Alguacil_2021.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/69/Bernardo_Atxaga_idazlea_2009an.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/00/Joseba_Sarrionandia_-_2016_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/69/Slalom_canoeing_2012_Olympics_W_K1_ESP_Maialen_Chourraut_%282%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/56/Maider_Unda%2C_2016-cropped.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/09/Enrique_Urbizu.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/d9/Malaga_Film_Festival_2025_-_Julio_Medem-2_%283x4_cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/fb/Joxe_miel_barandiaran.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/5c/%28Juan_Ignacio_Zoido%29_Visita_a_la_Jefatura_Superior_de_Polic%C3%ADa.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/7/72/Koldo_Mitxelena-2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b3/David_Etxebarria_EB05.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/8/84/I%C3%B1aki_Urdangar%C3%ADn.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a2/MikelAstarloza.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b5/TDF24586_nieve_%2829899053028%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4e/Oier_sanjurjo.jpg',
];

(async () => {
  console.log('Fetching current data from server...');
  const current = await apiGet();
  const entities = current.entities || {};

  // Update Spain
  const spain = entities.spain || { id: 'spain', name: 'Spain', flag: 'flags/spain.svg', images: [] };
  const spainExisting = new Set(spain.images.map(i => i.url));
  let spainAdded = 0;
  SPAIN_URLS.forEach((url, i) => {
    if (!spainExisting.has(url)) { spain.images.push(mkImg('sp_' + i, url)); spainAdded++; }
  });
  entities.spain = spain;
  console.log('Spain: added ' + spainAdded + ' (total: ' + spain.images.length + ')');

  // Update Basque
  const basque = entities.basque || { id: 'basque', name: 'Basque Country', flag: 'flags/basque.svg', images: [] };
  const basqueExisting = new Set(basque.images.map(i => i.url));
  let basqueAdded = 0;
  BASQUE_URLS.forEach((url, i) => {
    if (!basqueExisting.has(url)) { basque.images.push(mkImg('bq_' + i, url)); basqueAdded++; }
  });
  entities.basque = basque;
  console.log('Basque: added ' + basqueAdded + ' (total: ' + basque.images.length + ')');

  // Delete test entities
  delete entities.test_entity;
  delete entities.spain_test;
  delete entities.spain2;

  // Upload ALL at once (avoid race conditions from sequential POSTs)
  console.log('\nUploading ALL entities in one request...');
  const bodySize = JSON.stringify({ entities }).length;
  console.log('Payload size:', (bodySize / 1024).toFixed(1) + 'KB');
  const result = await apiPost({ entities });
  console.log('Result:', result);

  // Verify
  console.log('\nVerifying...');
  const check = await apiGet();
  Object.entries(check.entities).forEach(([k, v]) => {
    if (v.images && v.images.length > 0) console.log('  ' + k + ': ' + v.images.length + ' images');
  });
})();
