// Capstone domain samples — three built-in messy exports from DIFFERENT
// domains, so the A→Z project can be demonstrated without the learner
// bringing a file. Each one deliberately carries every mess class the gym
// profiler flags (blanks, case chaos, junk numerics, mixed date formats,
// doubled spaces, exact duplicate rows) AND at least one clean numeric
// measure column, so the describe/aggregate/brief templates all fire.
//
// Same contract as GYM_SAMPLE_CSV in lib/messy-gym.ts: paste-ready CSV,
// header row + data, mess included on purpose.

/** Gym check-ins — a fitness-domain export (the gym's namesake dataset).
 *  plan/city hide behind casing, dues wear $ costumes, dates mix three
 *  formats, visit_minutes is the clean measure, trainer has holes. */
export const CAP_FITNESS_CSV = [
  "member_id,member_name,plan,city,checkin_date,visit_minutes,monthly_due,trainer",
  'M-101,Anna Smith,Pro,Boston,2024-03-04,65,"$45.00",K. Reyes',
  'm-101,"Anna  Smith",pro,boston,03/14/2024,70,45,k. reyes',
  'M-102,Ben Osei,Gold,Austin,2024-02-27,45,"$60.00",T. Vaughn',
  'm-102,Ben Osei,gold,austin,27-Feb-2024,50,N/A,T. Vaughn',
  'M-103,Chloe Fontaine,Pro,Chicago,2024-03-08,80,"$45.00",',
  'M-104,Diego Marino,Basic,Denver,2024-02-15,30,"$29.99",P. Stein',
  'm-104,"Diego  Marino",basic,denver,2/25/2024,35,29.99,p. stein',
  'M-105,Emma Kowalski,Gold,Boston,2024-03-11,95,"$60.00",K. Reyes',
  'M-106,Farid Nasser,Basic,Austin,2024-01-30,25,"$29.99",P. Stein',
  'm-106,farid nasser,BASIC,austin,8-Feb-2024,20,tbd,',
  'M-107,Grace Liu,Pro,Chicago,2024-02-02,75,"$45.00",T. Vaughn',
  'M-108,Hugo Bianchi,Gold,Denver,2024-02-20,55,"$60.00",K. Reyes',
  'm-108,Hugo Bianchi,gold,denver,2/29/2024,60,60.00,k. reyes',
  'M-109,Imani Wright,Pro,Boston,2024-01-25,85,"$45.00",T. Vaughn',
  'M-110,Jonas Berg,Basic,Chicago,2024-03-01,40,"$29.99",',
  'm-110,Jonas Berg,basic,chicago,3/12/2024,45,29.99,p. stein',
  'M-111,Kira Nadar,Gold,Austin,2024-02-22,65,"$60.00",K. Reyes',
  'M-112,Liam Doyle,Pro,Denver,2024-02-12,90,"$45.00",T. Vaughn',
  'm-112,"Liam  Doyle",PRO,denver,21-Feb-2024,95,45.00,t. vaughn',
  'M-113,Maya Okafor,Basic,Boston,2024-01-26,30,"$29.99",P. Stein',
  'M-114,Noah Fischer,Gold,Chicago,2024-02-16,50,"$60.00",K. Reyes',
  'm-114,noah fischer,gold,CHICAGO,26-Feb-2024,,60.00,',
  'M-115,Olivia Casta,Pro,Austin,2024-02-09,70,"$45.00",T. Vaughn',
  'M-116,Pavel Ruskov,Basic,Denver,2024-03-05,35,"$29.99",K. Reyes',
  'm-116,Pavel Ruskov,basic,denver,3/15/2024,40,tbd,p. stein',
  'M-117,Quinn Harper,Gold,Boston,2024-02-28,60,"$60.00",T. Vaughn',
  'M-118,Rosa Vargas,Pro,Chicago,2024-02-20,85,"$45.00",K. Reyes',
  'm-118,Rosa Vargas,pro,chicago,2/27/2024,80,45.00,k. reyes',
  'M-101,Anna Smith,Pro,Boston,2024-03-04,65,"$45.00",K. Reyes',
  'M-112,Liam Doyle,Pro,Denver,2024-02-12,90,"$45.00",T. Vaughn',
].join("\n");

/** Sales orders — a commerce export. region/status hide behind casing,
 *  unit_price wears $ and comma costumes, order_date mixes three formats,
 *  quantity is the clean measure, customers carry doubled spaces. */
export const CAP_SALES_CSV = [
  "order_id,customer,region,product,quantity,unit_price,order_date,status",
  'O-2201,Hartley & Co,West,Desk Lamp,3,"$42.50",2024-03-04,shipped',
  'o-2201,"Hartley  & Co",WEST,Desk Lamp,3,42.50,03/14/2024,Shipped',
  'O-2202,Munoz Supply,East,Office Chair,1,"$189.00",2024-02-27,pending',
  'O-2203,Tran Logistics,Central,Monitor Arm,2,"$95.00",2024-03-08,shipped',
  'o-2203,Tran Logistics,central,Monitor Arm,2,95.00,18-Mar-2024,SHIPPED',
  'O-2204,Bergman Retail,West,Standing Desk,1,"$449.00",2024-02-15,cancelled',
  'O-2205,Okafor Books,East,Desk Lamp,5,"$42.50",2024-03-11,shipped',
  'o-2205,"Okafor  Books",east,Desk Lamp,5,42.50,3/21/2024,shipped',
  'O-2206,Costa Foods,Central,Mini Fridge,1,"$129.00",2024-01-30,pending',
  'O-2207,Nakamura Tools,West,Tool Set,4,"$59.00",2024-02-02,shipped',
  'o-2207,Nakamura Tools,west,Tool Set,4,59.00,8-Feb-2024,N/A',
  'O-2208,Delacroix Media,East,Office Chair,2,"$189.00",2024-02-20,shipped',
  'O-2209,Whitfield Farms,Central,Standing Desk,2,"$449.00",2024-01-25,shipped',
  'o-2209,"Whitfield  Farms",central,Standing Desk,2,449.00,05-Feb-2024,shipped',
  'O-2210,Antonov Parts,West,Monitor Arm,3,"$95.00",2024-03-01,pending',
  'O-2211,Silva Customs,East,Mini Fridge,2,"$129.00",2024-03-12,shipped',
  'o-2211,Silva Customs,east,Mini Fridge,2,129.00,3/22/2024,SHIPPED',
  'O-2212,Baptiste Sport,Central,Desk Lamp,6,"$42.50",2024-02-22,shipped',
  'O-2213,Yu Manufacturing,West,Tool Set,2,"$59.00",2024-02-12,cancelled',
  'o-2213,"Yu  Manufacturing",WEST,Tool Set,2,59.00,21-Feb-2024,Cancelled',
  'O-2214,Grant & Sons,East,Standing Desk,1,"$449.00",2024-01-26,shipped',
  'O-2215,Patel Trading,Central,Office Chair,3,"$189.00",2024-02-16,shipped',
  'o-2215,Patel Trading,central,Office Chair,3,N/A,26-Feb-2024,shipped',
  'O-2216,Kowal Design,West,Mini Fridge,1,"$129.00",2024-02-09,pending',
  'O-2217,Eriksen Marine,East,Desk Lamp,4,"$42.50",2024-03-05,shipped',
  'o-2217,Eriksen Marine,east,Desk Lamp,4,42.50,3/15/2024,shipped',
  'O-2204,Bergman Retail,West,Standing Desk,1,"$449.00",2024-02-15,cancelled',
  'O-2213,Yu Manufacturing,West,Tool Set,2,"$59.00",2024-02-12,cancelled',
].join("\n");

/** HR roster — a people export. department/performance hide behind casing,
 *  bonus wears $ costumes (salary stays clean so the payroll brief can
 *  fire), hire_date mixes three formats, manager has holes. */
export const CAP_HR_CSV = [
  "employee_id,employee_name,department,location,hire_date,salary,bonus,performance,manager",
  'E-501,Alice Winters,Engineering,Boston,2021-03-15,98000,"$8,000",A,R. Feld',
  'e-501,"Alice  Winters",ENGINEERING,boston,03/15/2021,98000,8000,a,r. feld',
  'E-502,Bruno Heller,Sales,Austin,2020-07-01,72000,"$5,500",B,M. Odum',
  'E-503,Carla Jimenez,Engineering,Denver,2022-01-10,105000,"$9,000",A,R. Feld',
  'e-503,Carla Jimenez,engineering,denver,10-Jan-2022,105000,9000,',
  'E-504,Dev Patel,Sales,Austin,2023-02-20,68000,"$4,000",C,M. Odum',
  'E-505,Elena Sokolova,Marketing,Boston,2021-11-05,76000,"$5,000",B,T. Grass',
  'e-505,"Elena  Sokolova",marketing,BOSTON,11/05/2021,76000,5000,b,t. grass',
  'E-506,Felix Braun,Engineering,Austin,2020-05-18,112000,"$11,000",A,R. Feld',
  'E-507,Gina Romano,Sales,Denver,2022-09-12,70000,"$4,500",B,M. Odum',
  'e-507,gina romano,sales,denver,12-Sep-2022,70000,4500,b,',
  'E-508,Hana Kobayashi,Marketing,Chicago,2023-04-03,74000,"$5,000",C,T. Grass',
  'E-509,Ivan Petrov,Engineering,Boston,2021-08-22,101000,"$8,500",A,R. Feld',
  'e-509,Ivan Petrov,ENGINEERING,boston,8/22/2021,101000,8500,a,r. feld',
  'E-510,Junko Aoki,Sales,Chicago,2023-06-30,66000,tbd,B,M. Odum',
  'E-511,Kofi Mensah,Marketing,Denver,2022-03-14,77000,"$5,500",B,T. Grass',
  'e-511,"Kofi  Mensah",marketing,denver,14-Mar-2022,77000,5500,b,',
  'E-512,Lara Crossetti,Engineering,Chicago,2020-12-01,108000,"$10,000",A,R. Feld',
  'E-513,Milo Anders,Sales,Boston,2023-01-09,69000,"$4,000",C,M. Odum',
  'e-513,milo anders,SALES,boston,1/9/2023,69000,4000,c,m. odum',
  'E-514,Nadia Rahman,Marketing,Austin,2021-06-25,75000,"$5,000",B,T. Grass',
  'E-515,Omar Haddad,Engineering,Denver,2022-11-17,104000,"$9,500",A,R. Feld',
  'e-515,omar haddad,engineering,DENVER,17-Nov-2022,104000,9500,a,',
  'E-516,Pia Lindqvist,Sales,Chicago,2023-08-08,67000,"$4,200",B,M. Odum',
  'E-501,Alice Winters,Engineering,Boston,2021-03-15,98000,"$8,000",A,R. Feld',
  'E-510,Junko Aoki,Sales,Chicago,2023-06-30,66000,tbd,B,M. Odum',
].join("\n");

/** E-commerce returns — a fulfillment export. brand/category feed the
 *  breakdown, status hides behind casing, price_paid wears $ costumes
 *  (units is the clean measure), requested_at mixes three formats,
 *  refund_amount + return_reason + agent are riddled with holes — the
 *  null-heaviest built-in file. */
export const CAP_ECOM_CSV = [
  "return_ref,shopper_email,item_sku,item_title,brand,category,price_paid,refund_amount,units,return_reason,status,requested_at,warehouse_site,agent_name",
  'R-9001,lera.hunt@example.com,SKU-1001,Aero Crop Hoodie,Bloom,Apparel,"$54.90","$54.90",1,too small,APPROVED,2024-01-04,Newark,Dana Whitfield',
  'R-9002,omar.d@example.com,SKU-1002,Trail Runner Socks,Nova,Apparel,"$12.40",,1,changed mind,approved,01/09/2024,Reno,marcus lee',
  'R-9003,jules.k@example.com,SKU-1003,Nimbus Desk Lamp,Aurora,Home,"$42.00","$42.00",1,damaged,Approved,2024-01-11,Atlanta,Priya Nair',
  'R-9004,,SKU-1004,,Kestrel,Kitchen,"$18.25",tbd,2,wrong item,REJECTED,13-Jan-2024,Fresno,',
  'R-9005,sena.p@example.com,SKU-1005,Bloom Yoga Mat,Bloom,Apparel,"$36.75","$36.75",1,too small,approved,2024-01-16,Newark,"Dana  Whitfield"',
  'R-9006,,SKU-1006,Nova Earbuds,Nova,Electronics,"$89.99",N/A,1,changed mind,Pending,01/18/2024,Reno,dana whitfield',
  'R-9007,mia.t@example.com,SKU-1007,Aurora Throw Pillow,Aurora,Home,"$27.50","$27.50",2,damaged,APPROVED,2024-01-21,Atlanta,"Priya  Nair"',
  'R-9008,theo.v@example.com,SKU-1008,Kestrel Cast Iron Pan,Kestrel,Kitchen,"$59.00",,1,late delivery,pending,23-Jan-2024,Fresno,Marcus Lee',
  'R-9009,,SKU-1009,,Bloom,Apparel,"$48.20","$48.20",1,too small,approved,2024-01-25,Newark,Tom Barrett',
  'R-9010,,SKU-1010,Nova Phone Stand,Nova,Electronics,"$21.90","$21.90",1,wrong item,Approved,01/27/2024,Reno,priya nair',
  'R-9011,liam.o@example.com,SKU-1011,Aurora Bookend Set,Aurora,Home,"$33.10",tbd,2,changed mind,REJECTED,2024-01-29,Atlanta,',
  'R-9012,zoe.c@example.com,SKU-1012,Bloom Leggings,Bloom,Apparel,"$39.40","$39.40",1,too small,approved,2024-02-01,Fresno,Dana Whitfield',
  'R-9013,kai.b@example.com,SKU-1013,Nova Charging Cable,Nova,Electronics,"$14.99",,2,damaged,PENDING,02/03/2024,Newark,"marcus  lee"',
  'R-9014,ivy.r@example.com,SKU-1014,Kestrel Spice Rack,Kestrel,Kitchen,"$44.60","$44.60",1,late delivery,approved,2024-02-05,Reno,Priya Nair',
  'R-9015,,SKU-1015,Aurora Wall Clock,Aurora,Home,"$52.30",N/A,1,changed mind,APPROVED,07-Feb-2024,Atlanta,tom barrett',
  'R-9016,nia.g@example.com,SKU-1016,Bloom Sports Bra,Bloom,Apparel,"$32.80","$32.80",1,too small,pending,2024-02-09,Fresno,',
  'R-9017,eli.w@example.com,SKU-1017,Nova Smart Bulb,Nova,Electronics,"$26.45","$26.45",1,damaged,approved,2024-02-12,Newark,dana whitfield',
  'R-9018,rose.d@example.com,SKU-1018,,Kestrel,Kitchen,"$29.70",,1,wrong item,Approved,02/14/2024,Reno,Marcus Lee',
  'R-9019,finn.h@example.com,SKU-1019,Aurora Desk Organizer,Aurora,Home,"$37.15","$37.15",2,late delivery,APPROVED,2024-02-17,Atlanta,priya nair',
  'R-9020,lucy.a@example.com,SKU-1020,Bloom Running Shorts,Bloom,Apparel,"$34.60",tbd,1,too small,rejected,2024-02-19,Fresno,"Tom  Barrett"',
  'R-9021,ben.s@example.com,SKU-1021,Nova Bluetooth Speaker,Nova,Electronics,"$74.25","$74.25",1,changed mind,approved,2024-02-22,Newark,',
  'R-9022,tara.j@example.com,SKU-1022,Kestrel Kettle,Kestrel,Kitchen,"$47.90",,1,damaged,Pending,02/24/2024,Reno,dana whitfield',
  'R-9023,hugo.m@example.com,SKU-1023,Aurora Photo Frame,Aurora,Home,"$19.35","$19.35",1,changed mind,approved,2024-02-26,Atlanta,marcus lee',
  'R-9024,,SKU-1024,Bloom Cap,Bloom,Apparel,"$22.10",N/A,1,too small,APPROVED,2024-02-28,Fresno,Priya Nair',
  'R-9025,wes.t@example.com,SKU-1025,Nova Power Bank,Nova,Electronics,"$49.85","$49.85",2,damaged,pending,2024-03-02,Newark,tom barrett',
  'R-9026,kim.r@example.com,SKU-1026,Kestrel Mixing Bowl,Kestrel,Kitchen,"$25.60",,1,late delivery,approved,04-Mar-2024,Reno,"Dana  Whitfield"',
  'R-9027,ana.y@example.com,SKU-1027,Aurora Storage Bin,Aurora,Home,"$31.20","$31.20",1,wrong item,REJECTED,2024-03-06,Atlanta,Marcus Lee',
  'R-9028,leo.p@example.com,SKU-1028,Bloom Trainer,Bloom,Apparel,"$67.30",tbd,1,too small,approved,2024-03-08,Fresno,priya nair',
  'R-9029,amy.c@example.com,SKU-1029,Nova Webcam,Nova,Electronics,"$58.40","$58.40",1,damaged,APPROVED,2024-03-11,Newark,',
  'R-9030,,SKU-1030,Kestrel Serving Tray,Kestrel,Kitchen,"$28.05",,2,changed mind,Pending,03/13/2024,Reno,tom barrett',
  'R-9031,fay.b@example.com,SKU-1031,Aurora Table Lamp,Aurora,Home,"$45.95","$45.95",1,late delivery,approved,2024-03-15,Atlanta,dana whitfield',
  'R-9032,idris.q@example.com,SKU-1032,Bloom Windbreaker,Bloom,Apparel,"$61.70",N/A,1,too small,approved,2024-03-18,Fresno,"Marcus  Lee"',
  'R-9033,,SKU-1033,Nova Mouse,Nova,Electronics,"$23.85","$23.85",1,changed mind,pending,2024-03-20,Newark,Priya Nair',
  'R-9034,colin.d@example.com,SKU-1034,Kestrel Utensil Set,Kestrel,Kitchen,"$38.50",,1,damaged,APPROVED,22-Mar-2024,Reno,"tom  barrett"',
  'R-9035,pia.v@example.com,SKU-1035,Aurora Coat Rack,Aurora,Home,"$53.25","$53.25",1,late delivery,approved,2024-03-25,Atlanta,dana whitfield',
  'R-9036,ravi.k@example.com,SKU-1036,,Bloom,Apparel,"$56.80",tbd,1,too small,rejected,2024-03-27,Fresno,marcus lee',
  'R-9037,tess.m@example.com,SKU-1037,Nova Tablet Mount,Nova,Electronics,"$17.60",,1,changed mind,approved,2024-03-29,Newark,"Priya  Nair"',
  'R-9038,omar.f@example.com,SKU-1038,Kestrel Bread Box,Kestrel,Kitchen,"$41.15","$41.15",1,damaged,APPROVED,2024-04-01,Reno,Tom Barrett',
  'R-9039,,SKU-1039,Aurora Mirror,Aurora,Home,"$64.90",N/A,1,wrong item,pending,2024-04-03,Atlanta,',
  'R-9040,,SKU-1040,Bloom Joggers,Bloom,Apparel,"$44.35","$44.35",2,too small,approved,03-Apr-2024,Fresno,Dana Whitfield',
  'R-9041,sara.g@example.com,SKU-1041,Nova Keyboard,Nova,Electronics,"$72.15",tbd,1,damaged,APPROVED,2024-04-05,Newark,marcus lee',
  'R-9042,mike.t@example.com,SKU-1042,Kestrel Coaster Set,Kestrel,Kitchen,"$16.80",,1,changed mind,pending,2024-04-08,Reno,priya nair',
  'R-9043,elle.j@example.com,SKU-1043,Aurora Curtains,Aurora,Home,"$49.60","$49.60",1,late delivery,approved,2024-04-10,Atlanta,tom barrett',
  'R-9044,ryan.h@example.com,SKU-1044,Bloom Tank Top,Bloom,Apparel,"$18.95",,1,too small,REJECTED,2024-04-12,Fresno,"dana  whitfield"',
  'R-9007,mia.t@example.com,SKU-1007,Aurora Throw Pillow,Aurora,Home,"$27.50","$27.50",2,damaged,APPROVED,2024-01-21,Atlanta,"Priya  Nair"',
  'R-9020,lucy.a@example.com,SKU-1020,Bloom Running Shorts,Bloom,Apparel,"$34.60",tbd,1,too small,rejected,2024-02-19,Fresno,"Tom  Barrett"',
].join("\n");

/** Marketing campaigns — a growth-team export. channel is the breakdown
 *  spine, status hides behind casing, spend_usd wears $ and comma costumes
 *  (conversions is the clean measure), start_date mixes three formats, and
 *  impressions/clicks/owner are heavily holed — nulls everywhere. */
export const CAP_MARKETING_CSV = [
  "campaign_ref,campaign_name,channel,country,start_date,status,spend_usd,impressions,clicks,conversions,owner",
  'C-3001,Spring Launch Wave 1,paid_search,US,2024-01-08,active,"$2,410.80",152000,4300,312,Ana Duarte',
  'C-3002,Winter Retention Blast,email,UK,01/11/2024,ACTIVE,"$640.00",,1240,96,ben okafor',
  'C-3003,January Clearance,social,DE,2024-01-15,active,"$1,180.25",96000,,141,Cara Vale',
  'C-3004,Brand Awareness Q1,display,IN,18-Jan-2024,paused,"$980.60",210000,980,54,Dev Singh',
  'C-3005,New Year New Gear,email,US,2024-01-22,completed,"$410.15",,1500,121,"Ana  Duarte"',
  'C-3006,Superbowl Teaser,paid_search,US,2024-01-29,active,"$3,150.00",240000,6100,402,',
  'C-3007,Valentine Bundles,social,UK,2024-02-01,active,"$1,320.45",88000,,188,',
  'C-3008,Flash Free Shipping,email,DE,05-Feb-2024,PAUSED,"$505.20",N/A,1310,88,Cara Vale',
  'C-3009,February Restock,display,IN,2024-02-08,active,"$760.90",,720,41,"Dev  Singh"',
  'C-3010,Loyalty Winback,email,US,2024-02-12,completed,"$385.75",36000,1420,133,ana duarte',
  'C-3011,Competitor Conquest,paid_search,UK,2024-02-15,active,"$2,780.30",198000,,365,Ben Okafor',
  'C-3012,Influencer Collab 03,social,DE,2024-02-19,active,"$1,540.10",104000,3100,205,cara vale',
  'C-3013,,display,IN,02/22/2024,paused,"$690.00",,610,38,',
  'C-3014,March Refresh,email,US,2024-02-26,completed,"$445.60",41000,1560,,Dev Singh',
  'C-3015,Q1 Brand Defense,paid_search,US,2024-03-01,active,"$2,930.55",205000,5700,389,ana duarte',
  'C-3016,Spring Lookbook,social,UK,2024-03-04,active,"$1,275.35",92000,,172,ben okafor',
  'C-3017,B2B Demo Days,email,DE,07-Mar-2024,active,"$520.80",29000,980,74,Cara Vale',
  'C-3018,Warehouse Clearance,display,IN,2024-03-11,completed,"$815.45",,800,47,dev singh',
  'C-3019,Marathon Sponsorship,paid_search,US,2024-03-14,active,"$3,420.70",260000,6800,441,',
  'C-3020,Newsletter Revamp,email,UK,2024-03-18,active,"$305.25",31000,,142,"ben  okafor"',
  'C-3021,UGC Contest,social,DE,2024-03-21,paused,"$1,110.90",86000,2200,149,cara vale',
  'C-3022,Retargeting Cart 04,display,IN,2024-03-25,active,"$940.15",,760,52,',
  'C-3023,Easter Promo,paid_search,US,03/28/2024,completed,"$2,655.40",188000,5200,348,Dev Singh',
  'C-3024,Tax Season Guides,email,UK,2024-04-01,active,"$360.70",34000,1180,91,ana duarte',
  'C-3025,Spring Sale Wave 2,paid_search,DE,2024-04-04,active,"$3,105.20",215000,,396,"Ben  Okafor"',
  'C-3026,Earth Month Push,social,IN,2024-04-08,active,"$1,085.65",,2050,136,cara vale',
  'C-3027,Free Trial Friday,email,US,2024-04-11,paused,"$415.30",37000,1290,102,',
  'C-3028,Affiliate Bootcamp,affiliate,US,2024-04-15,active,"$720.85",62000,1900,,Ana Duarte',
  'C-3029,Partner Co-Op 02,affiliate,UK,2024-04-18,completed,"$655.40",58000,1700,109,ben okafor',
  'C-3030,,paid_search,DE,2024-04-22,active,"$2,890.75",,5500,371,',
  'C-3031,Mothers Day Teaser,social,IN,2024-04-25,active,"$1,240.50",90000,,158,Cara Vale',
  'C-3032,Referral Rewards,affiliate,US,2024-04-29,active,"$540.20",48000,1450,96,dev singh',
  'C-3033,Summer Preview,display,UK,05/02/2024,paused,"$780.95",,690,44,ana duarte',
  'C-3034,Grad Gifting,email,DE,2024-05-06,completed,N/A,35000,1330,104,Ben Okafor',
  'C-3035,Bestsellers Restock,paid_search,IN,2024-05-09,active,"$2,510.35",182000,4950,336,"cara  vale"',
  'C-3036,Outdoor Season Kickoff,social,US,2024-05-12,active,"$1,395.80",98000,,194,Dev Singh',
  'C-3037,Loyalty Double Points,email,UK,2024-05-15,active,"$445.10",40000,1520,125,ana duarte',
  'C-3038,Memorial Day Sale,paid_search,DE,2024-05-18,completed,"$3,020.45",,5850,388,ben okafor',
  'C-3039,Creator Spotlight 07,social,IN,2024-05-21,paused,"$1,165.25",89000,2150,147,',
  'C-3040,Back In Stock Alerts,email,US,2024-05-24,active,"$330.90",30000,1105,87,',
  'C-3041,Summer Fitness Push,affiliate,UK,2024-05-27,active,"$685.55",60000,,114,"Dev  Singh"',
  'C-3042,Mid-Year Audit Sale,display,DE,2024-05-30,active,"$870.30",,810,49,',
  'C-3043,Fathers Day Gifts,paid_search,IN,02-Jun-2024,active,"$2,735.60",191000,5350,362,Ben Okafor',
  'C-3044,Summer Kickoff,paid_search,US,2024-06-05,active,"$1,430.15",101000,2850,201,cara vale',
  'C-3013,,display,IN,02/22/2024,paused,"$690.00",,610,38,',
  'C-3030,,paid_search,DE,2024-04-22,active,"$2,890.75",,5500,371,',
].join("\n");

export interface CapSample {
  key: "fitness" | "sales" | "hr" | "ecommerce" | "marketing";
  label: string;
  tableName: string;
  blurb: string;
  csv: string;
}

/** View-facing sample registry (the messy finance sample lives in
 *  lib/messy-gym.ts as GYM_SAMPLE_CSV and stays the first offering). */
export const CAP_SAMPLES: CapSample[] = [
  {
    key: "fitness",
    label: "Gym check-ins",
    tableName: "gym_checkins",
    blurb: "member visits, plans & dues — fitness domain",
    csv: CAP_FITNESS_CSV,
  },
  {
    key: "sales",
    label: "Sales orders",
    tableName: "sales_orders",
    blurb: "orders, regions & prices — commerce domain",
    csv: CAP_SALES_CSV,
  },
  {
    key: "hr",
    label: "HR roster",
    tableName: "hr_roster",
    blurb: "staff, salaries & reviews — people domain",
    csv: CAP_HR_CSV,
  },
  {
    key: "ecommerce",
    label: "Shop returns",
    tableName: "shop_returns",
    blurb: "refunds, brands & warehouses — e-commerce domain, hole-heavy",
    csv: CAP_ECOM_CSV,
  },
  {
    key: "marketing",
    label: "Campaign metrics",
    tableName: "campaign_metrics",
    blurb: "channels, spend & conversions — marketing domain, hole-heavy",
    csv: CAP_MARKETING_CSV,
  },
];
