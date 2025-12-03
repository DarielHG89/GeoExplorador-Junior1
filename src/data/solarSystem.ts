import { CountryData } from '../types';

export const SOLAR_SYSTEM_INFO: Record<string, CountryData> = {
  // --- ESTRELLA ---
  "Sun": {
    name: "El Sol",
    population: "1.4 millones km", // Diámetro
    area: "0 km", // Distancia
    language: "5,500 °C", // Temp
    capital: "Estrella", // Tipo
    funFact: "¡Es tan grande que cabrían más de un millón de Tierras dentro!",
    description: "Es la estrella que nos da luz y calor. Sin el Sol, no habría vida en la Tierra.",
    flag: "☀️",
    continent: "Sistema Solar",
    currency: "---",
    isPlanet: true
  },

  // --- PLANETAS ROCOSOS ---
  "Mercury": {
    name: "Mercurio",
    population: "4,880 km",
    area: "58 millones km",
    language: "167 °C",
    capital: "Planeta Rocoso",
    funFact: "¡Un año en Mercurio dura solo 88 días terrestres porque va muy rápido!",
    description: "Es el planeta más pequeño y cercano al Sol. Tiene muchos cráteres como la Luna.",
    flag: "🪐",
    continent: "Sistema Solar",
    currency: "88 días",
    isPlanet: true
  },
  "Venus": {
    name: "Venus",
    population: "12,104 km",
    area: "108 millones km",
    language: "464 °C",
    capital: "Planeta Rocoso",
    funFact: "¡Gira al revés que los demás planetas y es el más caliente de todos!",
    description: "A menudo se le llama el 'gemelo de la Tierra' por su tamaño, pero es muy tóxico.",
    flag: "🪐",
    continent: "Sistema Solar",
    currency: "225 días",
    isPlanet: true
  },
  "Earth": {
    name: "La Tierra",
    population: "12,742 km",
    area: "150 millones km",
    language: "15 °C (Media)",
    capital: "Planeta Rocoso",
    funFact: "¡Es el único lugar del universo conocido donde hay vida!",
    description: "Nuestro hogar, un planeta azul cubierto mayormente por agua.",
    flag: "🌍",
    continent: "Sistema Solar",
    currency: "365 días",
    isPlanet: true
  },
  "Mars": {
    name: "Marte",
    population: "6,779 km",
    area: "228 millones km",
    language: "-65 °C",
    capital: "Planeta Rocoso",
    funFact: "¡Tiene el volcán más alto de todo el sistema solar: el Monte Olimpo!",
    description: "El 'Planeta Rojo', lleno de óxido y polvo. Los científicos buscan si hubo vida.",
    flag: "🪐",
    continent: "Sistema Solar",
    currency: "687 días",
    isPlanet: true
  },

  // --- CINTURÓN DE ASTEROIDES ---
  "Ceres": {
    name: "Ceres",
    population: "946 km",
    area: "Cinturón de Asteroides",
    language: "-105 °C",
    capital: "Planeta Enano",
    funFact: "¡Es el objeto más grande del cinturón de asteroides!",
    description: "Un mundo pequeño de roca y hielo entre Marte y Júpiter. Fue el primer planeta enano descubierto.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "4.6 años",
    isPlanet: true
  },

  // --- GIGANTES GASEOSOS ---
  "Jupiter": {
    name: "Júpiter",
    population: "139,820 km",
    area: "778 millones km",
    language: "-110 °C",
    capital: "Gigante Gaseoso",
    funFact: "¡Tiene una tormenta roja gigante que lleva activa cientos de años!",
    description: "El planeta más grande de todos. Es básicamente una bola gigante de gas.",
    flag: "🪐",
    continent: "Sistema Solar",
    currency: "12 años",
    isPlanet: true
  },
  "Saturn": {
    name: "Saturno",
    population: "116,460 km",
    area: "1,400 millones km",
    language: "-140 °C",
    capital: "Gigante Gaseoso",
    funFact: "¡Es tan ligero que si hubiera una piscina gigante, flotaría en el agua!",
    description: "Famoso por sus espectaculares anillos hechos de hielo y rocas.",
    flag: "🪐",
    continent: "Sistema Solar",
    currency: "29 años",
    isPlanet: true
  },
  "Uranus": {
    name: "Urano",
    population: "50,724 km",
    area: "2,900 millones km",
    language: "-195 °C",
    capital: "Gigante de Hielo",
    funFact: "¡Gira de lado, como si estuviera rodando por su órbita!",
    description: "Un planeta azul pálido y muy frío, hecho de hielos y gases.",
    flag: "🪐",
    continent: "Sistema Solar",
    currency: "84 años",
    isPlanet: true
  },
  "Neptune": {
    name: "Neptuno",
    population: "49,244 km",
    area: "4,500 millones km",
    language: "-200 °C",
    capital: "Gigante de Hielo",
    funFact: "¡Tiene los vientos más fuertes del sistema solar, más rápidos que un avión!",
    description: "El planeta más lejano, oscuro y frío. Es de un color azul intenso.",
    flag: "🪐",
    continent: "Sistema Solar",
    currency: "165 años",
    isPlanet: true
  },
  
  // --- TRANSNEPTUNIANOS ---
  "Pluto": {
    name: "Plutón",
    population: "2,376 km",
    area: "5,900 millones km",
    language: "-229 °C",
    capital: "Planeta Enano",
    funFact: "¡Tiene un gran corazón blanco en su superficie hecho de hielo!",
    description: "Aunque es muy pequeño, tiene 5 lunas. Es un mundo helado.",
    flag: "🪐",
    continent: "Sistema Solar",
    currency: "248 años",
    isPlanet: true
  },
  "Eris": {
    name: "Eris",
    population: "2,326 km",
    area: "Disco Disperso",
    language: "-230 °C",
    capital: "Planeta Enano",
    funFact: "¡Su descubrimiento provocó que Plutón dejara de ser considerado un planeta!",
    description: "Es uno de los planetas enanos más grandes y lejanos. Tiene una luna llamada Disnomia.",
    flag: "❄️",
    continent: "Sistema Solar",
    currency: "559 años",
    isPlanet: true
  },

  // --- LUNAS DE LA TIERRA ---
  "Moon": {
    name: "La Luna",
    population: "3,474 km",
    area: "384,400 km (a Tierra)",
    language: "-20°C a 120°C",
    capital: "Satélite de la Tierra",
    funFact: "¡Las huellas de los astronautas seguirán ahí por millones de años!",
    description: "Nuestro único satélite natural. Controla las mareas de los océanos.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "27 días",
    isPlanet: true
  },

  // --- LUNAS DE MARTE ---
  "Phobos": {
    name: "Fobos",
    population: "22 km",
    area: "Órbita a Marte",
    language: "-40 °C",
    capital: "Luna de Marte",
    funFact: "¡Su nombre significa 'Miedo' y se está acercando lentamente a Marte!",
    description: "Una luna pequeña e irregular, parece una patata espacial.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "7 horas",
    isPlanet: true
  },
  "Deimos": {
    name: "Deimos",
    population: "12 km",
    area: "Órbita a Marte",
    language: "-40 °C",
    capital: "Luna de Marte",
    funFact: "¡Su nombre significa 'Terror', pero es solo una roca pequeña y tranquila!",
    description: "Es muy pequeña y lisa, cubierta de mucho polvo espacial.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "30 horas",
    isPlanet: true
  },

  // --- LUNAS DE JÚPITER ---
  "Io": {
    name: "Ío",
    population: "3,642 km",
    area: "Órbita a Júpiter",
    language: "Muy caliente",
    capital: "Luna de Júpiter",
    funFact: "¡Es el lugar con más volcanes activos de todo el Sistema Solar!",
    description: "Una luna de Júpiter que parece una pizza por sus colores amarillos y rojos.",
    flag: "🌕",
    continent: "Sistema Solar",
    currency: "1.7 días",
    isPlanet: true
  },
  "Europa": {
    name: "Europa",
    population: "3,122 km",
    area: "Órbita a Júpiter",
    language: "-160 °C",
    capital: "Luna de Júpiter",
    funFact: "¡Creen que hay un océano gigante de agua líquida debajo de su hielo!",
    description: "Una luna helada de Júpiter con muchas rayas rojas en su superficie.",
    flag: "❄️",
    continent: "Sistema Solar",
    currency: "3.5 días",
    isPlanet: true
  },
  "Ganymede": {
    name: "Ganimedes",
    population: "5,268 km",
    area: "Órbita a Júpiter",
    language: "-163 °C",
    capital: "Luna de Júpiter",
    funFact: "¡Es la luna más grande de todas, incluso es más grande que Mercurio!",
    description: "El rey de las lunas. Tiene su propio campo magnético.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "7.1 días",
    isPlanet: true
  },
  "Callisto": {
    name: "Calisto",
    population: "4,820 km",
    area: "Órbita a Júpiter",
    language: "-139 °C",
    capital: "Luna de Júpiter",
    funFact: "¡Es el objeto con más cráteres del sistema solar!",
    description: "Una luna muy antigua y llena de cicatrices de choques de asteroides.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "16.7 días",
    isPlanet: true
  },

  // --- LUNAS DE SATURNO ---
  "Titan": {
    name: "Titán",
    population: "5,150 km",
    area: "Órbita a Saturno",
    language: "-179 °C",
    capital: "Luna de Saturno",
    funFact: "¡Tiene lagos y ríos, pero no son de agua, sino de gas líquido!",
    description: "La única luna con una atmósfera densa y nubes naranjas.",
    flag: "🟠",
    continent: "Sistema Solar",
    currency: "16 días",
    isPlanet: true
  },
  "Enceladus": {
    name: "Encélado",
    population: "500 km",
    area: "Órbita a Saturno",
    language: "-198 °C",
    capital: "Luna de Saturno",
    funFact: "¡Dispara chorros de hielo al espacio como géiseres gigantes!",
    description: "Una bola de hielo blanca y brillante. Es muy reflectante.",
    flag: "⚪",
    continent: "Sistema Solar",
    currency: "1.4 días",
    isPlanet: true
  },
  "Mimas": {
    name: "Mimas",
    population: "396 km",
    area: "Órbita a Saturno",
    language: "-200 °C",
    capital: "Luna de Saturno",
    funFact: "¡Se parece muchísimo a la 'Estrella de la Muerte' de Star Wars!",
    description: "Tiene un cráter gigante llamado Herschel que ocupa casi un tercio de la luna.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "0.9 días",
    isPlanet: true
  },
  "Tethys": {
    name: "Tetis",
    population: "1,060 km",
    area: "Órbita a Saturno",
    language: "-187 °C",
    capital: "Luna de Saturno",
    funFact: "¡Tiene un cañón gigante llamado Ithaca Chasma que recorre casi toda la luna!",
    description: "Una luna hecha casi totalmente de hielo de agua.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "1.9 días",
    isPlanet: true
  },
  "Dione": {
    name: "Dione",
    population: "1,120 km",
    area: "Órbita a Saturno",
    language: "-186 °C",
    capital: "Luna de Saturno",
    funFact: "¡Tiene acantilados de hielo brillante que parecen rayas blancas!",
    description: "Muy densa y rocosa, con muchos cráteres.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "2.7 días",
    isPlanet: true
  },
  "Rhea": {
    name: "Rea",
    population: "1,528 km",
    area: "Órbita a Saturno",
    language: "-174 °C",
    capital: "Luna de Saturno",
    funFact: "¡Es la segunda luna más grande de Saturno después de Titán!",
    description: "Un cuerpo helado muy antiguo y lleno de cráteres.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "4.5 días",
    isPlanet: true
  },
  "Iapetus": {
    name: "Jápeto",
    population: "1,470 km",
    area: "Órbita a Saturno",
    language: "-143 °C",
    capital: "Luna de Saturno",
    funFact: "¡Es mitad blanca como la nieve y mitad negra como el carbón!",
    description: "Conocida como la luna del yin y el yang por sus dos colores.",
    flag: "🌗",
    continent: "Sistema Solar",
    currency: "79 días",
    isPlanet: true
  },


  // --- LUNAS DE URANO ---
  "Titania": {
    name: "Titania",
    population: "1,576 km",
    area: "Órbita a Urano",
    language: "-200 °C",
    capital: "Luna de Urano",
    funFact: "¡Es la reina de las lunas de Urano, la más grande!",
    description: "Una luna oscura y misteriosa cubierta de hielo sucio y rocas.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "8.7 días",
    isPlanet: true
  },
  "Oberon": {
    name: "Oberón",
    population: "1,522 km",
    area: "Órbita a Urano",
    language: "-200 °C",
    capital: "Luna de Urano",
    funFact: "¡Tiene montañas que alcanzan los 6 km de altura!",
    description: "La luna más lejana de Urano, llena de cráteres antiguos.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "13.5 días",
    isPlanet: true
  },
  "Miranda": {
    name: "Miranda",
    population: "470 km",
    area: "Órbita a Urano",
    language: "-200 °C",
    capital: "Luna de Urano",
    funFact: "¡Parece que fue rota y vuelta a armar como un rompecabezas mal hecho!",
    description: "Tiene los acantilados más altos del sistema solar, ¡de 20 km de caída!",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "1.4 días",
    isPlanet: true
  },
  "Ariel": {
    name: "Ariel",
    population: "1,158 km",
    area: "Órbita a Urano",
    language: "-213 °C",
    capital: "Luna de Urano",
    funFact: "¡Es la luna más brillante de Urano!",
    description: "Tiene valles profundos y cañones formados por hielo.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "2.5 días",
    isPlanet: true
  },
  "Umbriel": {
    name: "Umbriel",
    population: "1,170 km",
    area: "Órbita a Urano",
    language: "-200 °C",
    capital: "Luna de Urano",
    funFact: "¡Es la más oscura de las lunas grandes de Urano, refleja muy poca luz!",
    description: "Un mundo sombrío y misterioso con un extraño anillo brillante en el polo.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "4.1 días",
    isPlanet: true
  },

  // --- LUNAS DE NEPTUNO ---
  "Triton": {
    name: "Tritón",
    population: "2,700 km",
    area: "Órbita a Neptuno",
    language: "-235 °C",
    capital: "Luna de Neptuno",
    funFact: "¡Gira al revés (retrógrada) comparada con las otras lunas!",
    description: "Es uno de los lugares más fríos. Tiene volcanes que escupen hielo.",
    flag: "❄️",
    continent: "Sistema Solar",
    currency: "5.9 días",
    isPlanet: true
  },
  "Proteus": {
    name: "Proteo",
    population: "420 km",
    area: "Órbita a Neptuno",
    language: "-200 °C",
    capital: "Luna de Neptuno",
    funFact: "¡Tiene forma de caja en lugar de ser redonda!",
    description: "Una luna oscura y llena de cráteres, difícil de ver en la oscuridad del espacio.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "1.1 días",
    isPlanet: true
  },

  // --- LUNAS DE PLUTÓN ---
  "Charon": {
    name: "Caronte",
    population: "1,212 km",
    area: "Órbita a Plutón",
    language: "-220 °C",
    capital: "Luna de Plutón",
    funFact: "¡Es tan grande comparada con Plutón que bailan uno alrededor del otro!",
    description: "La luna más grande de Plutón. Siempre se muestran la misma cara el uno al otro.",
    flag: "🌑",
    continent: "Sistema Solar",
    currency: "6.4 días",
    isPlanet: true
  }
};