// ===== CURRICULUM DATA =====
const SUBJECTS_TEMPLATE = [
  {name:'English Language', code:'OxAQA 9270', pri:3, topics:[
    'Reading literary non-fiction','Writer\'s purpose and viewpoint',
    'Analysing language and structure','Collating and synthesising sources',
    'Descriptive writing','Discursive writing','Creative writing',
    'Writing for audience and purpose','Spoken language endorsement'
  ]},
  {name:'English Literature', code:'OxAQA 9275', pri:3, topics:[
    'Modern prose/drama set text','19th century novel','Poetry anthology',
    'Unseen poetry','Comparing texts','Context and themes',
    'Language, structure and form analysis','Essay writing technique'
  ]},
  {name:'Extended Maths', code:'Cambridge 0607', pri:4, topics:[
    'Integers, fractions and decimals','Powers and surds','Ratio and proportion',
    'Percentages','Estimation and rounding','Standard form',
    'Expressions and formulae','Expanding and factorising','Linear equations',
    'Simultaneous equations','Quadratic equations','Inequalities','Sequences',
    'Functions','Straight line graphs','Curve sketching',
    'Trigonometry — right-angled','Trigonometry — non-right-angled',
    'Angles and polygons','Circles and theorems','Vectors and transformations',
    'Mensuration','Probability','Averages and spread','Statistical graphs',
    'Sets and Venn diagrams','GDC use','Investigation and modelling'
  ]},
  {name:'Further Maths', code:'Edexcel 4PM1', pri:3, topics:[
    'Number theory and proof','Advanced algebra','Matrices',
    'Differentiation','Integration','Further trigonometry',
    'Logarithms and exponentials','Conics','Inequalities and modulus',
    'Series','Complex numbers','Numerical methods'
  ]},
  {name:'Chemistry', code:'Edexcel 4CH1', pri:4, topics:[
    'States of matter','Separation techniques','Atomic structure',
    'Ionic bonding','Covalent bonding','Metallic bonding',
    'Moles and formulae','Chemical equations','Acids, bases and salts',
    'Energetics','Rates of reaction','Equilibrium',
    'Redox and electrolysis','Metals and reactivity','Extraction of metals',
    'Haber process','Contact process','Alkanes','Alkenes',
    'Alcohols and acids','Polymers','Water purification',
    'Atmosphere and pollution','Instrumental analysis'
  ]},
  {name:'Biology', code:'Edexcel 4BI1', pri:4, topics:[
    'Cell structure','Biological molecules','Enzymes','Diffusion and osmosis',
    'Human nutrition','Photosynthesis','Respiration','Gas exchange',
    'Circulation','Transpiration','Excretion and kidneys',
    'Nervous system','Hormones','Homeostasis','Reproduction',
    'Genetics and DNA','Variation','Evolution','Ecosystems',
    'Nutrient cycles','Human impact','Biotechnology'
  ]},
  {name:'Physics', code:'Edexcel 4PH1', pri:4, topics:[
    'Motion and speed','Newton\'s Laws','Momentum','Energy and power',
    'Density and pressure','Wave properties','Light and optics',
    'Electromagnetic spectrum','Sound','Current and charge',
    'Series and parallel circuits','Resistance','Electrical power',
    'Mains electricity','Magnetism','Electromagnets',
    'Electromagnetic induction','Radioactivity','Nuclear energy',
    'Space','Thermal energy transfer'
  ]},
  {name:'Computer Science', code:'Cambridge 0478', pri:3, topics:[
    'Binary and hexadecimal','Images, sound and text data',
    'Data transmission','Networks and topologies','Hardware components',
    'CPU architecture','Operating systems','Internet and the web',
    'Cybersecurity','AI and automation','Decomposition and abstraction',
    'Flowcharts and pseudocode','Searching algorithms','Sorting algorithms',
    'Variables and data types','Selection and iteration',
    'Arrays and lists','Subroutines','Databases and SQL',
    'Boolean logic and gates','Testing and debugging'
  ]},
  {name:'Food and Nutrition', code:'AQA 8585', pri:3, topics:[
    'Macronutrients','Micronutrients','Water and fibre','Energy balance',
    'Diet across life stages','Food provenance','Heat and cooking',
    'Raising and setting agents','Pastry, bread and dough',
    'Sauces and soups','Food safety and bacteria','Hygiene and storage',
    'Food labelling','Sensory evaluation','Dietary analysis',
    'NEA 1 — food science investigation','NEA 2 — food preparation assessment'
  ]},
  {name:'Geography', code:'Cambridge 0460', pri:3, topics:[
    'Population distribution','Population growth','Migration',
    'Urbanisation','Settlement patterns','River processes',
    'River landforms','Flooding','Coastal processes','Coastal landforms',
    'Earthquakes','Volcanoes','Tropical storms','Climate change',
    'Tropical rainforest','Hot deserts','Agriculture','Industry',
    'Tourism','Energy resources','Water supply','Development and HDI',
    'Aid and trade','Hazard management','Mapwork and skills'
  ]},
  {name:'Business Studies', code:'Cambridge 0450', pri:3, topics:[
    'Business activity','Opportunity cost','Business sectors',
    'Sole trader and partnership','Limited companies','Business growth',
    'Objectives and stakeholders','Motivation theories',
    'Organisational structure','Recruitment and training','Communication',
    'Market research','Market segmentation','Product life cycle',
    'Pricing strategies','Promotion and branding','Distribution channels',
    'Operations management','Quality management','Location decisions',
    'Sources of finance','Cash flow','Income statements','Balance sheets',
    'Economic factors','Legal and ethical issues','Globalisation'
  ]}
];
