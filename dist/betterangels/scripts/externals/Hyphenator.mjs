/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 25 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

/*
 * Comments are jsdoc3 formatted. See http://usejsdoc.org
 * Use mergeAndPack.html to get rid of the comments and to reduce the file size of this script!
 */

/* The following comment is for JSLint: */
/* jslint browser: true, multivar: true, eval: true */

/*global Hyphenator window*/

var Hyphenator
Hyphenator = (function (window) {
  'use strict'

  const LANGUAGES = {
    leftmin: 2,
    rightmin: 3,
    specialChars: '',
    patterns: {
      3: 'x1qei2e1je1f1to2tlou2w3c1tue1q4tvtw41tyo1q4tz4tcd2yd1wd1v1du1ta4eu1pas4y1droo2d1psw24sv1dod1m1fad1j1su4fdo2n4fh1fi4fm4fn1fopd42ft3fu1fy1ga2sss1ru5jd5cd1bg3bgd44uk2ok1cyo5jgl2g1m4pf4pg1gog3p1gr1soc1qgs2oi2g3w1gysk21coc5nh1bck1h1fh1h4hk1zo1ci4zms2hh1w2ch5zl2idc3c2us2igi3hi3j4ik1cab1vsa22btr1w4bp2io2ipu3u4irbk4b1j1va2ze2bf4oar1p4nz4zbi1u2iv4iy5ja1jeza1y1wk1bk3fkh4k1ikk4k1lk1mk5tk1w2ldr1mn1t2lfr1lr3j4ljl1l2lm2lp4ltn1rrh4v4yn1q1ly1maw1brg2r1fwi24ao2mhw4kr1cw5p4mkm1m1mo4wtwy4x1ar1ba2nn5mx1ex1h4mtx3i1muqu2p3wx3o4mwa1jx3p1naai2x1ua2fxx4y1ba2dn1jy1cn3fpr2y1dy1i',
      4: '4dryn2itni4on1inn1im_up3nik4ni4dy5giye4tyes4_ye44ab_nhe4nha4abe2n2gyn1guy1ery5eep2pe4abry3lay3lone4wne4v1nesy3chn1erne2q3neo1nenp2seps4hy2cey5lu2nedne2cyme44nk2y5at2adine2b2ne_y5ac2p1tp2ten1den1cun1cryn5dp2th4adup4twpub3ae4rxu3ayn5gaff4pue4n2au4p1ppuf4n2atag1ipu4mag1na2gon4asx3tix1t2pu2na4gya3haa3heah4la3ho_ti2a5ian2an5puspu2tnak4_th2n1kl_te4_ta4mu4u4mupmun23mum2alex4ob_sy25ynxal1i_st4y1o4xi5cxi5a4alm_si2_sh2m5sixhu4m4sh4m3r4amam2py2rabm2pixhi2yo5dr2ai4m1pmo2vmos2x2edmo2r4n1la2mor2asx3c2xas5yom4x4apxam3nme44mokrbi2nne44andy4osp4ot3noemn4omn4a4m1n4nog4m1l2angws4l1posw3shwri4wra4yp3iwom11wo2m2izrb4ow4nopo4pr2cem2isrd2iano4mig4y3pomi3awiz55mi_no4n4m1fme4v2re_wir42mes1menme2mme2gre1o2med4me_4nop4m5c4m1bwil21noureu2whi4w3ev4maprev2w1era2plpo4crfu4r4fyy5pu2maha3pu2mab2a2rn1p4npi44lyb4lya2p3nwam42l1w1lut4luplu3or1glluf4lu5a2wacltu2y3rol1tr4vv4r3guyr4rl1te4rh_nru4ar1il2sel4sc4l1rl5prl4plys4c4lovri3ar4ib4lof3lo_ar2par3q_os3ll4oll2i4as_ri1o3vokl2levoi44p1mlka35vo_ns4cas4ll1izr4iqr2is3vivl1it3lika2tan2sen2slrle42l3hlgo3l5gal5frns3mvi4p3ley_od2r2meles24athr4myle2al3drv1inldi4l2de2vilnt2il3civik4lce42l1b4lavv3ifrno4r3nua1trr2ocnt4sy4sok4syks4la2tuk4sck3ouko5ryss4a2tyau4b4klyys1tnu1akis4au3rki4pro4ek4ima2va5ki_nu4dn4umn3uokes4k1erav1irok2ke4g1keek2ed_me2aw3ikal4aws4k5agk3ab3ka_aye4ays4veg3jo4p5ba_4vedjew3n1v24ve_ja4pzar23vatizi4n1w41batba4z2b1bb2beix4o4i5w4b1d4be_rox5nym4nyp4n3za4ittr3por1r4i1ti1bel2ith2itei2su4rs2r1sars4cr2seis1p3betvag4i2sor1shbe3wr1sioad34b3hbi2bbi4d3bie3isf4ise2is_1bilr1sp5va_r5sw_le2uz4eir1ibi2tuxu3r1tiu1v2i1raze4nze4pb2l2uu4mo1biip3iz1eripe4b4louts44b1m4b3no3br3bodi4osbo4eru3aio4mi1ol4io_3booo1ce4inyin1u2insru2n2inn4inl4inkrv4e2inioch42iner3vo4indpi2np4idbt4lb4tob3trry4cry3t2in_o4elbu4ni2muim1i5saiil3v4ilnil1iil5fs1apo3er4b5w5by_bys4_in1sau4i1lazet4u2suo3ev2z1ii2go4igius1p5saw4s5bo2fi4ifti3fl4if_i3etsch2usc22ie4i2dui4dri2diid5dpi3au3ruz4ils1cuz4is4s5d4se_se4a2ce_2ici4ich3ceii1bri5bo1ceni1blse2g5seiibe43cepi2aniam4ur2li2al2i1acet4hy2scew41phy4ch_5phuhu4thu4gche2h4tyh4shur1durc44hr44h5p5sev5sexu1ra4s3fup3p2s3gph3t2sh_ho4g2h1n_he23ciau3pl4h1mci5ch2lozo4m4ciihi2vhi4p2cim2cin4phsu1peu1ouo1geu5osheu4sho4he4th1es4shwun5zun5ysi1bunu45cizo4glck3ihep5he2nh4ed1sioph2l5hazsi2rcly4zte4_ge21siscoe22cog5siu1siv5siz_ga24skes1l2s2leha4m2s1ms3ma1ogyo1h2u1ni3gus3gun2guegu4acov1gth3_eu3g4ros1n4_es3u2nez4zyum2pu1mi3som_ev2oig4cri2gov15goos4opgon2ul5v5goeu3lugob53go_2c1t4ph_g1nog1nic2te4sov4ulsgn4ag4myc4twcud5c4ufc4uipe2t3glo1gleul2igla4_eg23giz3cun5givgi4u3gir5gio1cusul4e2spagil4g1ic5gi__eb4cze41d2a5da_u1laggo44daf2dagg2gege4v1geo1gen2ged3dato1la2ge_ol2dol2i5daypek4p4eed1d42de_4gazol2tuiv3ol2vo2lys1sa2gamgaf4o2meui4n2ui2pe2cd4em4fugi4jku3fl3ufaf2tyf4to1denu4du4pe_2f3sfri2de1ps1si4f5pfos5d3eqs4sls4snfo2rss2tdes25fon4p1b_ci23payss5w2st_de1tf4l2de1v2fin4dey4d1fd4gast2idg1id2gyd1h25di_ud5dfi3au4cy_ch4pav43didu3cud1iff2fyu3crd1inst4r4f1ffev4fer11dio2fedfe4bdir2s2ty4fe_dis1on1au3ca4f5bon1c2ondd5k25far4fagpa1peys45eyc1exps4ul2dlyp4ale3whon3s3do_e1wa5doee5vud4oge1visu2msu2nub4euav4su2rp4ai6rk_d4or3dosu1atdo4v3doxp4adoo4k4swoo2padre4eus4e3upe5un2ophet5z4syc3syl4y3hoy1ads4pd4swd4syd2tho4wo3ta_du2c4etn2tabta2luac4es4wdu4g2ess4uabdu4n4duptav4st5bow1io1pr5dyn2tawe1sp2t1bop1uead1tz4et4chopy5ea4l4t1d4te_2tyle1si4esh1tee4tyat1cr4twoteg4es2c4eru1teoer1s2eroea2tte4po1rat1wh3tusea2v3teu3texer1i2e1ber1h4tey2t1f4t1ge3br2th_th2e4thle1ce3tumec2i2ths2erb1tia4tueer1aou5vtud2tif22tige1potu1aou4lttu41timt5toos4le1cre2pat4swe5owe1cue4ottsh4eos4e1ort4sce3ol4edieo2ge5of1tio4eno4enn5tiq4edoti4u1tive3my1tiz4othee2ct5laee2ft5lo4t1mee2mtme4e1meem5bcoi4to3be5exo1ry2tof1effel2iel2ftos24t1pe1la1traos2ceig2ei5de5ico2soe1h45egyeg5n',
      5: '_ach4e4go_e4goseg1ule5gurtre5feg4iceher4eg5ibeger44egaltre4mei5gle3imbe3infe1ingtra3beir4deit3eei3the5ity5triae4jud3efiteki4nek4la2trime4la_e4lactri4v4toute4law5toure3leaefil45elece4ledto2rae5len4tonye1lestro3ve4fic4tonoto3mytom4bto2mato5ice5limto2gre3lioe2listru5i4todo4ellaee4tyello4e5locel5ogeest4el2shel4tae5ludel5uge4mace4mage5man2t1n2ee2s4ee4p1e2mele4metee4naemi4eee4lyeel3i3tled3tle_e4mistlan4eed3iem3iztrus4emo4gti3zaem3pie4mule4dulemu3ne4dritiv4aedon2e4dolti3tle5neae5neeen3emtis4pti5sotis4m3tisee3newti3sae5niee5nile3nioedi5zen3ite5niu5enized1ited3imeno4ge4nosen3oven4swti5oc4t1s2en3uaen5ufe3ny_4en3zed3ibe3diae4oi4ede4s3tini4ed3deo3ret2ina2e2dae4culeo4toe5outec4te4t3t2t4tes2t1ine5pel4timpe2corephe4e4plie2col5tigutu3arti5fytu4bie3pro3tienep4sh5tidie4putt4icoeci4t4tick2ti2bec3imera4bti4aber3ar4tuf45tu3ier4bler3che4cib2ere_4thooecca54thil3thet4thea3turethan4e4cade4bitere4qe4ben5turieret4tur5oeav5oeav5itu5ry4tess4tes_ter5ve1rio4eriter4iueri4v1terier3m4ter3cte5pe4t1waer3noeast3er5obe5rocero4rer1oue3assea5sp1tent4ertler3twtwis4eru4t3tende1s4a3tenc5telsear2te2scateli4e3scres5cue1s2ee2sec3tel_te5giear5kear4cte5diear3ae3sha2t1ede5ande2sice2sid5tecttece44teattype3ty5phesi4uea4gees4mie2sole3acte2sone1a4bdys5pdy4sedu4petaun4d3uleta5sytas4e4tare4tarctar4ata5pl2estrta5mo4talke2surtal3idu5eleta4bta5lae3teoua5naet1ic4taf4etin4ta5doe5tir4taciuan4id1ucad1u1ae3trae3tre2d1s2syn5ouar2d4drowet3uaet5ymdro4pdril4dri4b5dreneu3rouar3ieute44draieu5truar3te2vasdop4pe5veadoo3ddoni4u4belsum3iev1erdoli4do4laev3idevi4le4vinevi4ve5voc2d5ofdo5dee4wage5wee4d1n4ewil54d5lue3wit2d3lou3ber5eye_u1b4i3dledfa3blfab3rfa4ce3dle_fain4suit3su5issu2g34d5lasu4b3fa3tasu1al4fato1di1vd2iti5disiuci4bfeas4di1redi4pl4feca5fectdio5gfe3life4mofen2d4st3wuc4it5ferr5diniucle3f4fesf4fie4stry1dinaf4flydi3ge3dictd4icedia5bs4tops1tle5stirs3tifs4ties1ticfic4is5tias4ti_4ficsfi3cuud3ers3thefil5iste2w4filyudev45finas4tedfi2nes2talfin4ns2tagde2tode4suflin4u1dicf2ly5ud5isu5ditde1scd2es_der5sfon4tu4don5dermss4lid4erhfor4is4siede2pudepi4fra4tf5reade3pade3nufril4frol5ud4side3nou4eneuens4ug5infu5el5dem_s5setfu5nefu3rifusi4fus4s4futade5lode5if4dee_5gal_3galiga3lo2d1eds3selg5amos2s5cssas3u1ing4ganouir4mgass4gath3uita4deaf5dav5e5dav44dato4darygeez44spotspor4s4pon4gelydark5s4ply4spio4geno4genydard5ge3omg4ery5gesigeth54getoge4tydan3g4g1g2da2m2g3gergglu5dach4gh3inspil4gh4to4cutr1gi4agia5rula5bspho5g4icogien5s2pheulch42sperspa4n5spai3c4utu1lenul4gigir4lg3islcu5pycu3picu4mic3umecu2maso5vi5glasu5liagli4bg3lig5culiglo3r4ul3mctu4ru1l4og4na_c3terul1tig2ning4nio4ultug4noncta4b4c3s2cru4dul5ulsor5dgo3isum5absor5ccris4go3nic4rinson4gsona45gos_cri5fcre4vum4bi5credg4raigran25solvsoft3so4ceunat44graygre4nco5zi4gritcoz5egruf4cow5ag5stecove4cos4es5menun4ersmel44corbco4pl4gu4tco3pacon5tsman3gy5racon3ghach4hae4mhae4th5aguha3lac4onecon4aun4ims3latu2ninhan4gs3ket5colocol5ihan4kuni3vhap3lhap5ttras4co4grhar2dco5agsir5aclim45sionhas5shaun44clichaz3acle4m1head3hearun3s4s3ingun4sws2ina2s1in4silysil4eh5elohem4p4clarhena45sidiheo5r1c4l4h4eras5icc2c1itu4orsh3ernshor4h3eryci3phshon34cipecion45cinoc1ingc4inahi5anhi4cohigh5h4il2shiv5h4ina3ship3cilihir4lhi3rohir4phir4rsh3iohis4ssh1inci4lau5pia4h1l4hlan44cier5shevcia5rhmet4ch4tish1erh5ods3cho2hoge4chi2z3chitho4mahome3hon4aho5ny3hoodhoon45chiouptu44ura_ho5ruhos4esew4ihos1p1housu4ragses5tu4rasur4behree5se5shs1e4s4h1s24chedh4tarht1enht5esur4fru3rifser4os4erlhun4tsen5gur1inu3riosen4dhy3pehy3phu1ritces5tur3iz4cesa4sencur4no4iancian3i4semeia5peiass45selv5selfi4atu3centse1le4ceniib5iaib3inseg3ruros43cencib3li3cell5cel_s5edli5bun4icam5icap4icar4s4ed3secticas5i4cayiccu44iceour4pe4ced_i5cidsea5wi2cipseas4i4clyur4pi4i1cr5icrai4cryic4teictu2ccon4urti4ic4umic5uoi3curcci4ai4daiccha5ca4thscof4ide4s4casys4cliscle5i5dieid3ios4choid1itid5iui3dlei4domid3owu5sadu5sanid5uous4apied4ecany4ield3s4cesien4ei5enn4sceii1er_i3esci1estus3ciuse5as4cedscav5if4frsca4pi3fieu5siau3siccan4eiga5bcan5d4calous5sli3gibig3ilig3inig3iti4g4lus1trig3orig5oti5greigu5iig1ur2c5ah4i5i44cag4cach4ca1blusur4sat3usa5tab5utoi3legil1erilev4uta4b4butail3iail2ibil3io3sanc2ilitil2izsal4t5bustil3oqil4tyil5uru3tati4magsa5losal4m4ute_4imetbu3res3act5sack2s1ab4imitim4nii3mon4utelbumi4bu3libu4ga4inav4utenbsor42b5s2u4tis4briti3neervi4vr3vic4inga4inger3vey4ingir3ven4ingo4inguu4t1li5ni_i4niain3ioin1isbo4tor5uscrunk5both5b5ota5bos42i1no5boriino4si4not5borein3seru3in2int_ru4glbor5di5nusut5of5bor_uto5gioge4io2grbon4au5tonru3enu4touion3iio5phior3ibod3iio5thi5otiio4toi4ourbne5gb3lisrt4shblen4ip4icr3triip3uli3quar4tivr3tigrti4db4le_b5itzira4bi4racird5ert5ibi4refbi3tri4resir5gibi5ourte5oir4isr3tebr4tagbin4diro4gvac3uir5ul2b3ifis5agis3arisas52is1cis3chbi4eris3erbi5enrson3be5yor5shais3ibisi4di5sisbe3tw4is4krs3es4ismsbe5trr3secva4geis2piis4py4is1sbe3sp4bes4be5nuval5ois1teis1tirrys4rros44be5mis5us4ita_rron4i4tagrri4vi3tani3tatbe3lorri4or4reoit4esbe1libe5gu4itiarre4frre4cbe3giit3igbe3dii2tim2itio4itisrp4h4r3pet4itonr4peait5rybe3debe3dai5tudit3ul4itz_4be2dbeat3beak4ro4varo4tyros4sro5roiv5ioiv1itror3i5root1roomval1ub3berva5mo4izarva5piron4eban3ijac4qban4ebal1ajer5srom4prom4iba4geazz5i5judgay5alax4idax4ickais4aw4ly3awaya1vorav5ocav3igke5liv3el_ve4lov4elyro1feke4tyv4erdv4e2sa5vanav3ag5k2ick4illkilo5au1thk4in_4ves_ro3crkin4gve4teaun5dk5ishau4l2au3gu4kleyaugh3ve4tyk5nes1k2noat3ulkosh4at5uekro5n4k1s2at5uaat4that5te5vianat4sk5vidil4abolaci4l4adela3dylag4nlam3o3landrob3la4tosr4noular4glar3ilas4ea4topr3nivr3nita2tomr5nica4toglbin44l1c2vi5gnat3ifat1ica5tiar3neyr5net4ati_ld5isat4hol4driv2incle4bileft55leg_5leggr4nerr3nel4len_3lencr4nar1lentle3phle4prvin5dler4e3lergr3mitl4eroat5evr4mio5lesq3lessr3menl3eva4vingrma5cvio3lvi1ou4leyevi5rovi3so4l1g4vi3sulgar3l4gesate5cat5apli4agli2amr3lo4li4asr4lisli5bir4ligr2led4lics4vitil4icul3icyl3idaat5ac3lidirk4lel4iffli4flr3ket3lighvit3r4vityriv3iri2tulim3ili4moris4pl4inar3ishris4clin3ir4is_li5og4l4iqlis4pas1trl2it_as4shas5phri2pla4socask3ia3sicl3kallka4ta3sibl4lawashi4l5leal3lecl3legl3lel5riphas4abar2shrin4grin4ear4sarin4dr2inal5lowarre4l5met3rimol4modlmon42l1n2a3roorim5ilo4civo4la5rigil5ogo3loguri5et5longlon4iri1erlood5r4icolop3il3opmlora44ricir4icerib3a5los_v5oleri4agria4blos4tlo4taar2mi2loutar2izar3iolpa5bl3phal5phi4rhall3pit5voltar4im3volv2l1s2vom5ivori4l4siear4fllt5agar4fivo4rylten4vo4talth3ia3reeltis4ar4drw5ablrgo4naraw4lu3brluch4lu3cilu3enwag5olu5idlu4ma5lumia5raur5gitwait5luo3rw5al_luss4r5gisar4atl5venrgi4nara3pwar4tar3alwas4tly5mely3no2lys4l5ysewa1teaque5ma2car3gicma4clr3get5magnwed4nmaid54maldrg3erweet3wee5vwel4lapoc5re4whwest3ap3in4aphires2tr4es_mar3vre5rumas4emas1t5matemath3rero4r4eriap5atr1er4m5bilre1pumbi4vapar4a5nuran3ul4med_an3uare5lure1lian4twre5itmel4tan2trre4fy4antomen4are3fire2fe4menemen4imens4re1de3ment2r2edme5onre4awwin4g5reavme4tare3anme1tere1alm4etr3wiserdin4rdi4aan4stwith3an2span4snan2samid4amid4gan5otwl4esr4dalm4illmin4a3mindrcum3rc4itr3charcen4min4tm4inumiot4wl3ina3niumis5lan3ita3nip4mithan3ioan1gla3neuws4per2bina3nena5neem4ninw5s4tan1dl4mocrrbi4fmo2d1mo4gomois2xac5ex4agor4bagmo3mer4baba3narrau4ta5monrare4rar5cra5nor4aniam1inr2amiam5ifra4lomo3spmoth3m5ouf3mousam3icxer4ixe5roraf4tr5aclm3petra3bixhil5mpi4aam3ag3quetm5pirmp5is3quer2que_qua5vmpov5mp4tram5ab3alyz4m1s25alyt4alysa4ly_ali4exi5di5multx4ime4aldia4laral3adal5abak1enain5opu3trn4abu4nac_na4can5act5putexpe3dna4lia4i4n4naltai5lya3ic_pur4rag5ulnank4nar3c4narenar3inar4ln5arm3agognas4c4ag4l4ageupul3cage4oaga4na4gab3nautnav4e4n1b4ncar5ad5umn3chaa3ducptu4rpti3mnc1innc4itad4suad3owad4len4dain5dana5diua3ditndi4ba3dion1ditn3dizn5ducndu4rnd2we3yar4n3eara3dianeb3uac4um5neckac3ulp4siba3cio5negene4laac1inne5mine4moa3cie4nene4a2cine4poyc5erac1er2p1s2pro1tn2erepro3lner4rych4e2nes_4nesp2nest4neswpri4sycom4n5evea4carab3uln4gabn3gelpre3vpre3rycot4ng5han3gibng1inn5gitn4glangov4ng5shabi5an4gumy4erf4n1h4a5bannhab3a5bal3n4iani3anni4apni3bani4bl_us5ani5dini4erni2fip3petn5igr_ure3_un3up3per_un5op3pennin4g_un5k5nis_p5pel_un1en4ithp4ped_un1ani3tr_to4pympa3_til4n3ketnk3inyn5ic_se2ny4o5gy4onsnmet44n1n2_ru4d5pounnni4vnob4lpo4tan5ocly4ped_ro4qyper5noge4pos1s_ri4gpo4ry1p4or_res2no4mono3my_ree2po4ninon5ipoin2y4poc5po4gpo5em5pod_4noscnos4enos5tno5tayp2ta3noun_ra4cnowl3_pi2tyra5m_pi4eyr5ia_out3_oth32n1s2ns5ab_or3t_or1d_or3cplu4mnsid1nsig4y3s2eys3ion4socns4pen5spiploi4_odd5nta4bpli4n_ni4cn5tib4plignti2fpli3a3plannti4p1p2l23ysis2p3k2ys3ta_mis1nu5enpi2tun3uinp3ithysur4nu1men5umi3nu4nyt3icnu3trz5a2b_li4t_li3o_li2n_li4g_lev1_lep5_len4pion4oard3oas4e3pi1ooat5ip4inoo5barobe4l_la4mo2binpind4_ju3rob3ul_is4i_ir5rp4in_ocif3o4cil_in3so4codpi3lopi3enocre33piec5pidipi3dep5ida_in2kod3icodi3oo2do4odor3pi4cypian4_ine2o5engze3rooe4ta_im3m_id4l_hov5_hi3b_het3_hes3_go4r_gi4bpho4ro5geoo4gero3gie3phobog3it_gi5azo5ol3phizo4groogu5i4z1z22ogyn_fes3ohab5_eye55phieph1icoiff4_en3sph4ero3ing_en3go5ism_to2qans3v_el5d_eer4bbi4to3kenok5iebio5mo4lanper1v4chs_old1eol3erpe5ruo3letol4fi_du4co3liaper3op4ernp4erio5lilpe5ono5liop4encpe4la_do4tpee4do5livcin2q3pediolo4rol5pld3tabol3ub3pedeol3uno5lusedg1le1loaom5ahoma5l2p2edom2beom4bl_de3o3fich3pe4ao4met_co4ro3mia_co3ek3shao5midom1inll1fll3teapa2teo4monom3pi3pare_ca4tlue1pon4aco3nanm2an_pa4pum2en_on5doo3nenng1hoon4guon1ico3nioon1iso5niupa3nypan4ao3nou_bri2pain4ra1oronsu4rk1hopac4tpa4ceon5umonva5_ber4ood5eood5i6rks_oop3io3ordoost5rz1scope5dop1erpa4ca_ba4g_awn4_av4i_au1down5io3pito5pon1sync_as1s_as1p_as3ctch1c_ar5so5ra_ow3elo3visov4enore5auea1mor3eioun2d_ant4orew4or4guou5etou3blo5rilor1ino1rio_ang4o3riuor2miorn2eo5rofoto5sor5pe3orrhor4seo3tisorst4o3tif_an5cor4tyo5rum_al3tos3al_af1tos4ceo4teso4tano5scros2taos4poos4paz2z3wosi4ue3pai',
      6: 'os3ityos3itoz3ian_os4i4ey1stroos5tilos5titxquis3_am5atot3er_ot5erso3scopor3thyweek1noth3i4ot3ic_ot5icao3ticeor3thiors5enor3ougor3ityor3icaouch5i4o5ria_ani5mv1ativore5sho5realus2er__an3teover3sov4erttot3icoviti4o5v4olow3dero4r3agow5esto4posiop3ingo5phero5phanthy3sc3operaontif5on3t4ionten45paganp3agattele2gonspi4on3omyon4odipan3elpan4tyon3keyon5est3oncil_ar4tyswimm6par5diompro5par5elp4a4ripar4isomo4gepa5terst5scrpa5thy_atom5sta1tio5miniom3icaom3ic_ss3hatsky1scpear4lom3ena_ba5naol3umer1veilpedia4ped4icolli4er1treuo5liteol3ishpeli4epe4nano5lis_pen4thol3ingp4era_r1thoup4erago3li4f_bas4er1krauperme5ol5id_o3liceper3tio3lescolass4oi3terpe5tenpe5tiz_be5raoi5son_be3smphar5iphe3nooi5letph4es_oi3deroic3esph5ingr3ial_3ognizo5g2ly1o1gis3phone5phonio5geneo4gatora3mour2amenofit4tof5itera3chupi4ciepoly1eod5dedo5cureoc3ula1pole_5ocritpee2v1param4oc3raco4clamo3chetob5ingob3a3boast5eoke1st3nu3itpi5thanuf4fentu3meoerst2o3chasplas5tn3tinepli5ernti4ernter3sntre1pn4s3esplum4bnsati4npre4cns4moonon1eqnor5abpo3et5n5lessn5oniz5pointpoly5tnon4agnk3rup3nomicng1sprno5l4inois5i4n3o2dno3blenni3aln5keroppa5ran3itor3nitionis4ta5nine_ni3miznd3thrmu2dron3geripray4e5precipre5copre3emm3ma1bpre4lan5gerep3rese3press_can5cmedi2c5pri4e_ce4la3neticpris3op3rocal3chain4er5ipros3en4erarnera5bnel5iz_cit5rne4gatn5d2ifpt5a4bjanu3aign4itn3chisn5chiln5cheon4ces_nau3seid4iosna3talnas5tinan4itnanci4na5mitna5liahnau3zput3er2n1a2bhex2a3hatch1multi3hair1sm4pousg1utanmpo3rim4p1inmp5iesmphas4rach4empar5iraf5figriev1mpara5mo5seyram3et4mora_rane5oran4gemo3ny_monol4rap3er3raphymo3nizgno5morar5ef4raril1g2nacg1leadmoni3ara5vairav3elra5ziemon5gemon5etght1wemoi5sege3o1dmma5ryr5bine3fluoren1dixmis4ti_de3ra_de3rie3chasrch4err4ci4bm4inglm5ineedu2al_3miliame3tryrdi4er_des4crd3ingdi2rerme5thimet3alre5arr3mestim5ersadi2rende2ticdes3icre4cremen4temensu5re3disred5itre4facmen4dede2mosmen5acmem1o3reg3ismel5onm5e5dyme3died2d5ibren4te5mediare5pindd5a5bdata1bmba4t5cle4arma3tisma5scemar4lyre4spichs3huma5riz_dumb5re3strre4terbrus4qre3tribio1rhre5utiman3izre4valrev3elbi1orbbe2vie_eas3ire5vilba1thyman5is5maniamal4tymal4lima5linma3ligmag5inav3ioul5vet4rg3inglus3teanti1dl5umn_ltur3a_el3emltera4ltane5lp5ingloun5dans5gra2cabllos5etlor5ouric5aslo5rie_enam35ricidri4cie5lope_rid5erri3encri3ent_semi5lom3errig5an3logicril3iz5rimanlob5allm3ingrim4pell5out5rina__er4ril5linal2lin4l3le4tl3le4nriph5eliv3er_ge5og_han5k_hi3er_hon3olin3ea1l4inel4im4p_idol3_in3ci_la4cy_lath5rit3iclim4blrit5urriv5elriv3et4l4i4lli4gra_leg5elif3errk4linlid5er4lict_li4cor5licioli4atorl5ish_lig5a_mal5o_man5a_mer3c5less_rm5ersrm3ingy3thinle5sco3l4erilera5b5lene__mon3ele4matld4erild4erela4v4ar1nis44lativ_mo3rola5tanlan4telan5etlan4dllab3ic_mu5takin4dek3est_ro5filk3en4dro5ker5role__of5te4jestyys3icaron4al5izont_os4tlron4tai4v3ot_pe5tero3pelrop3ici5voreiv5il__pio5n_pre3mro4the_ran4tiv3en_rov5eliv3ellit3uati4tramr5pentrp5er__rit5ui4tismrp3ingit5ill_ros5tit3ica4i2tici5terirre4stit3era4ita5mita4bi_row5dist4lyis4ta_is4sesrsa5tiissen4is4sal_sci3erse4crrs5er_islan4rse5v2yo5netish5opis3honr4si4bis5han5iron_ir4minrtach4_self5iri3turten4diri5dei4rel4ire4de_sell5r4tieriq3uidrtil3irtil4lr4tilyr4tistiq5uefip4re4_sing4_ting4yn3chrru3e4lion3at2in4th_tin5krum3pli4no4cin3ityrun4ty_ton4aruti5nymbol5rvel4i_top5irv5er_r5vestin5geni5ness_tou5s_un3cein3cerincel45ryngei4n3auim3ulai5miniimi5lesac3riim5ida_ve5rasalar4ima5ryim3ageill5abil4istsan4deila5rai2l5am_wil5ii4ladeil3a4bsa5voright3iig3eraab5erd4ific_iff5enif5eroi3entiien5a45ie5gaidi5ou3s4cieab5latidi4arid5ianide3al4scopyab5rogid5ancic3ulaac5ardi2c5ocic3ipaic5inase2c3oi4carai4car_se4d4ei2b5riib5iteib5it_ib5ertib3eraac5aroi4ativ4ian4tse4molsen5ata5ceouh4warts5enedhus3t4s5enin4sentd4sentlsep3a34s1er_hun5kehu4min4servohro3poa5chethov5el5se5umhouse3sev3enho5senhort3eho5rishor5at3hol4ehol5arh5odizhlo3riac5robhis3elhion4ehimer4het4edsh5oldhe2s5ph5eroushort5here5aher4bahera3p3side_5sideshen5atsi5diz4signahel4lyact5ifhe3l4ihe5do55sine_h5ecathe4canad4dinsion5aad5er_har4lehard3e3sitioha5rasha3ranhan4tead3icahang5oadi4ersk5inesk5ing5hand_han4cyhan4cislith5hala3mh3ab4lsmall32g5y3n5gui5t3guard5smithad5ranaeri4eag5ellag3onia5guerso4labsol3d2so3licain5in4grada3s4on_gor5ougo5rizgondo5xpan4dait5ens5ophyal3end3g4o4ggnet4tglad5i5g4insgin5ge3g4in_spen4d2s5peog3imen5gies_3spher5giciagh5outsp5ingge5nizge4natge5lizge5lisgel4inxi5miz4gativgar5n4a5le5oga3nizgan5isga5mets5sengs4ses_fu4minfres5cfort5assi4erss5ilyfore5tfor5ayfo5ratal4ia_fon4dessur5aflo3ref5lessfis4tif1in3gstam4i5stands4ta4p5stat_fin2d5al5levs5tero4allicstew5afight5fi5del5ficie5ficiafi3cer5stickf3icena5log_st3ingf3icanama5ra5stockstom3a5stone2f3ic_3storef2f5iss4tradam5ascs4trays4tridf5fin_fend5efeath3fault5fa3thefar5thfam5is4fa4mafall5eew3inge5verbeven4ie5vengevel3oev3ellev5asteva2p5euti5let5roset3roget5rifsy5rinet3ricet5onaam5eraam5ilyami4noamor5ieti4noe5tidetai5loethod3eten4dtal5enes5urramp5enan3ageta5loge5strotan4detanta3ta5pere3ston4es2toes5times3tigta3rizestan43analy4taticta4tures4prean3arces3pertax4ises5onaes3olue5skintch5etanar4ies4i4ntead4ie2s5ima3natiande4sesh5enan3disan4dowang5iete5geres5ences5ecres5cana4n1icte2ma2tem3at3tenanwrita45erwau4tenesert3era3nieser3set5erniz4erniter4nis5ter3de4rivaan3i3fter3isan4imewo5vener3ineeri4ere3rient3ess_teth5e5ericke1ria4er3ester5esser3ent4erenea5nimier5enaer3emoth3easthe5atthe3iser5el_th5ic_th5icaere3in5thinkere5coth5odea5ninee3realan3ishan4klier4che5anniz4erandti4atoanoth5equi3lep5utat4ic1uan4scoe4probep3rehe4predans3poe4precan4surantal4e3penttim5ulep5anceo5rol3tine_eop3aran4tiewin4deap5eroen3ishen5icsen3etren5esten5esien5eroa3pheren3dicap3itae4nanten5amoem5ulaa3pituti3zen5emnize5missem5ishap5olaem5ine3tles_t5let_em1in2apor5iem3icaem5anael3op_el4labapos3te3liv3el5ishaps5esweath3e3lierel3icaar3actwa5verto3nate3libee4l1erel3egato3rietor5iza5radeelaxa4aran4gto3warelan4dej5udie5insttra5chtraci4ar5av4wa5gere5git5arbal4ar5easeg5ing4voteetrem5iar3enta5ressar5ial4tricsvor5abe3finetro5mitron5i4tronyar3iantro3sp5eficia3rieted5uloed3icae4d1erec3ulaec4tane4cremeco5roec3orae4concar5o5de4comme4cluse4clame5citeec5ifya5ronias3anta5sia_tu4nis2t3up_ecan5ce4belstur3ise4bel_eav3ene4a3tue5atifeath3ieat5eneart3eear4ilear4icear5eseam3ereal3oueal5erea5geread5iedum4be4ducts4duct_duc5eras3tenasur5adrea5rat3abl4d5outdo3natdom5izdo5lor4dlessu4bero3dles_at3alou3ble_d4is3tdirt5idi5niz3dine_at5ech5di3endi4cam1d4i3ad3ge4tud5estdev3ilde3strud3iedud3iesdes3tide2s5oat3egovis3itde4nardemor5at3en_uen4teuer4ilde5milat3eraugh3en3demicater5nuil5izdeli4ede5comde4cildecan4de4bonv3io4rdeb5it4dativ2d3a4bat3estu5laticu4tie5ulcheul3dercuss4icu5riaath5em3cultua5thenul3ingul5ishul4lar4vi4naul4liscu5ityctim3ic4ticuuls5esc5tantultra3ct5angcros4ecrop5ocro4pl5critiath5omum4blycre3at5vilitumor5oat5i5b5crat_cras5tcoro3ncop3iccom5ercol3orun5ishco3inc5clareat3ituunt3abat5ropun4tescit3iz4cisti4cista4cipicc5ing_cin3em3cinatuper5s5videsup3ingci2a5b5chini5videdupt5ib5vide_at4tag4ch1inch3ersch3er_ch5ene3chemiche5loure5atur4fercheap3vi5aliat3uravet3er4ch3abc5e4taau5sib3cessives4tece5ram2cen4e4cedenccou3turs5erur5tesur3theaut5enur4tiecav5al4cativave4nover3thcar5omca5percan4tycan3izcan5iscan4icus4lin3versecal4laver3ieca3latca5dencab3in3butiobuss4ebus5iebunt4iv4eresuten4i4u1t2iv3erenu3tineut3ingv4erelbroth35u5tizbound34b1orabon5at5vere_bom4bibol3icblun4t5blespblath5av3erav5enuebi3ogrbi5netven3om2v1a4bvac5ilbi3lizbet5izbe5strva5liebe5nigbbi4nabas4siva5nizbari4aav5ernbarbi5av5eryvel3liazi4eravi4er',
      7: '_dri5v4ban5dagvar5iedbina5r43bi3tio3bit5ua_ad4derution5auti5lizver5encbuf4ferus5terevermi4ncall5incast5ercas5tigccompa5z3o1phros5itiv5chanicuri4fico5stati5chine_y5che3dupport54v3iden5cific_un4ter_at5omiz4oscopiotele4g5craticu4m3ingv3i3liz4c3retaul4li4bcul4tiscur5a4b4c5utiva5ternauiv4er_del5i5qdem5ic_de4monsdenti5fdern5izdi4latou4b5ingdrag5on5drupliuar5ant5a5si4tec5essawo4k1enec5ifiee4compear5inate4f3eretro5phewide5sp5triciatri5cesefor5ese4fuse_oth5esiar5dinear4chantra5ventrac4tetrac4itar5ativa5ratioel5ativor5est_ar5adisel5ebraton4alie4l5ic_wea5rieel5igibe4l3ingto5cratem5igraem3i3niemoni5oench4erwave1g4a4pillavoice1ption5eewill5inent5age4enthesvaude3vtill5inep5recaep5ti5bva6guer4erati_tho5rizthor5it5thodicer5ence5ternitteri5zater5iesten4tage4sage_e4sagese4sert_an5est_e4sertse4servaes5idenes5ignaesis4tees5piraes4si4btal4lisestruc5e5titioounc5erxe4cutota5bleset5itiva4m5atoa4matis5stratu4f3ical5a5lyst4ficatefill5instern5isspend4gani5zasqual4la4lenti4g3o3nas5ophiz5sophicxpecto55graph_or5angeuri4al_4graphy4gress_smol5d4hang5erh5a5nizharp5enhar5terhel4lishith5erhro5niziam5eteia4tricic4t3uascour5au2r1al_5scin4dover4nescan4t55sa3tiou5do3ny_ven4de_under5ty2p5al_anti5sylla5bliner4arturn3ari5nite_5initioinsur5aion4eryiphras4_tim5o5_ten5an_sta5blrtroph4_se5rieiq3ui3t5i5r2izis5itiviso5mer4istral5i5ticki2t5o5mtsch3ie_re5mittro3fiti4v3er_i4vers_ros5per_pe5titiv3o3ro_ped5alro5n4is_or5ato4jestierom5ete_muta5bk5iness4latelitr4ial__mist5i_me5terr4ming_lev4er__mar5tilev4eralev4ers_mag5a5liar5iz5ligaterit5ers_lat5errit5er_r5ited__im5pinri3ta3blink5er_hon5ey5litica_hero5ior5aliz_hand5irip5lic_gen3t4tolo2gylloqui5_con5grt1li2erbad5ger4operag_eu4lertho3donter2ic__ar4tie_ge4ome_ge5ot1_he3mo1_he3p6a_he3roe_in5u2tpara5bl5tar2rht1a1mintalk1a5ta3gon_par5age_aster5_ne6o3f_noe1thstyl1is_poly1s5pathic_pre1ampa4tricl3o3niz_sem4ic_semid6_semip4_semir45ommend_semiv4lea4s1a_spin1oom5etryspher1o_to6poglo4ratospe3cio3s2paceso2lute_we2b1l_re1e4ca5bolicom5erseaf6fishside5swanal6ysano5a2cside5stl5ties_5lumniasid2ed_anti1reshoe1stscy4th1s4chitzsales5wsales3cat6tes_augh4tlau5li5fom5atizol5ogizo5litiorev5olure5vertre5versbi5d2ifbil2lab_earth5pera5blro1tronro3meshblan2d1blin2d1blon2d2bor1no5ro1bot1re4ti4zr5le5quperi5stper4malbut2ed_but4tedcad5e1moist5enre5stalress5ibchie5vocig3a3roint5er4matizariv1o1lcous2ticri3tie5phisti_be5stoog5ativo2g5a5rr3a3digm4b3ingre4posir4en4tade4als_od5uctsquasis6quasir6re5fer_p5trol3rec5olldic1aiddif5fra3pseu2dr5ebrat5metric2d1lead2d1li2epro2g1epre1neuod5uct_octor5apoin3came5triem5i5liepli5narpara3memin5glim5inglypi4grappal6matmis4er_m5istryeo3graporth1riop1ism__but4tio3normaonom1icfeb1ruafermi1o_de4moio5a5lesodit1icodel3lirb5ing_gen2cy_n4t3ingmo5lestration4get2ic_4g1lishobli2g1mon4ismnsta5blmon4istg2n1or_nov3el3ns5ceivno1vembmpa5rabno4rarymula5r4nom1a6lput4tinput4tedn5o5miz_cam4penag5er_nge5nesh2t1eoun1dieck2ne1skiifac1etncour5ane3backmono1s6mono3chmol1e5cpref5ac3militapre5tenith5i2lnge4n4end5est__capa5bje1re1mma1la1ply5styr1kovian_car5olprin4t3lo2ges_l2l3ishprof5it1s2tamp',
      8: 'lead6er_url5ing_ces5si5bch5a5nis1le1noidlith1o5g_chill5ilar5ce1nym5e5trych5inessation5arload4ed_load6er_la4c3i5elth5i2lyneg5ativ1lunk3erwrit6er_wrap3arotrav5es51ke6linga5rameteman3u1scmar1gin1ap5illar5tisticamedio6c1me3gran3i1tesima3mi3da5bves1titemil2l1agv1er1eigmi6n3is_1verely_e4q3ui3s5tabolizg5rapher5graphicmo5e2lasinfra1s2mon4ey1lim3ped3amo4no1enab5o5liz_cor5nermoth4et2m1ou3sinm5shack2ppo5sitemul2ti5uab5it5abimenta5rignit1ernato5mizhypo1thani5ficatuad1ratu4n5i4an_ho6r1ic_ua3drati5nologishite3sidin5dling_trib5utin5glingnom5e1non1o1mistmpos5itenon1i4so_re5stattro1p2istrof4ic_g2norespgnet1ism5glo5binlem5aticflow2er_fla1g6elntrol5lifit5ted_treach1etra1versl5i5ticso3mecha6_for5mer_de5rivati2n3o1me3spac6i2t3i4an_thy4l1antho1k2er_eq5ui5to4s3phertha4l1amt3ess2es3ter1geiou3ba3dotele1r6ooxi6d1iceli2t1isonspir5apar4a1leed1ulingea4n3iesoc5ratiztch3i1er_kil2n3ipi2c1a3dpli2c1abt6ap6athdrom3e5d_le6icesdrif2t1a_me4ga1l1prema3cdren1a5lpres2plipro2cess_met4ala3do5word1syth3i2_non1e2m_post1ampto3mat4rec5ompepu5bes5cstrib5utqu6a3si31stor1ab_sem6is4star3tliqui3v4arr1abolic_sph6in1de5clar12d3aloneradi1o6gs3qui3tosports3wsports3cra5n2hascro5e2cor3bin1gespokes5wspi2c1il_te3legrcroc1o1d_un3at5t_dictio5cat1a1s2buss4ingbus6i2esbus6i2erbo2t1u1lro5e2las1s2pacinb1i3tivema5rine_r3pau5li_un5err5r5ev5er__vi2c3arback2er_ma5chinesi5resid5losophyan3ti1n2sca6p1ersca2t1olar2rangesep3temb1sci2uttse3mes1tar3che5tsem1a1ph',
      9: 're4t1ribuuto5maticl3chil6d1a4pe5able1lec3ta6bas5ymptotyes5ter1yl5mo3nell5losophizlo1bot1o1c5laratioba6r1onierse1rad1iro5epide1co6ph1o3nscrap4er_rec5t6angre2c3i1prlai6n3ess1lum5bia_3lyg1a1miec5ificatef5i5nites2s3i4an_1ki5neticjapan1e2smed3i3cinirre6v3ocde2c5linao3les3termil5li5listrat1a1gquain2t1eep5etitiostu1pi4d1v1oir5du1su2per1e6_mi1s4ers3di1methy_mim5i2c1i5nitely_5maph1ro15moc1ra1tmoro6n5isdu1op1o1l_ko6r1te1n3ar4chs_phi2l3ant_ga4s1om1teach4er_parag6ra4o6v3i4an_oth3e1o1sn3ch2es1to5tes3toro5test1eror5tively5nop5o5liha2p3ar5rttrib1ut1_eth1y6l1e2r3i4an_5nop1oly_graph5er_5eu2clid1o1lo3n4omtrai3tor1_ratio5na5mocratiz_rav5en1o',
      10: 'se1mi6t5ic3tro1le1um5sa3par5iloli3gop1o1am1en3ta5bath3er1o1s3slova1kia3s2og1a1myo3no2t1o3nc2tro3me6c1cu2r1ance5noc3er1osth1o5gen1ih3i5pel1a4nfi6n3ites_ever5si5bs2s1a3chu1d1ri3pleg5_ta5pes1trproc3i3ty_s5sign5a3b3rab1o1loiitin5er5arwaste3w6a2mi1n2ut1erde3fin3itiquin5tes5svi1vip3a3r',
      11: 'pseu3d6o3f2s2t1ant5shimi1n2ut1estpseu3d6o3d25tab1o1lismpo3lyph1onophi5lat1e3ltravers3a3bschro1ding12g1o4n3i1zat1ro1pol3it3trop1o5lis3trop1o5lesle3g6en2dreeth1y6l1eneor4tho3ni4t',
      12: '3ra4m5e1triz1e6p3i3neph1'
    },
    patternChars: '_abcdefghijklmnopqrstuvwxyz',
    patternArrayLength: 113949,
    valueStoreLength: 20195
  }

  var contextWindow = window

  var supportedLangs = (function () {

    var r = {},

      o = function (code, file, script, prompt) {
        r[code] = { file: file, script: script, prompt: prompt }
      }

    o(
      'be',
      'be.js',
      1,
      'Мова гэтага сайта не можа быць вызначаны аўтаматычна. Калі ласка пакажыце мову:'
    )
    o('ca', 'ca.js', 0, '')
    o(
      'cs',
      'cs.js',
      0,
      'Jazyk této internetové stránky nebyl automaticky rozpoznán. Určete prosím její jazyk:'
    )
    o(
      'cu',
      'cu.js',
      1,
      'Ꙗ҆зы́къ сегѡ̀ са́йта не мо́жетъ ѡ҆предѣле́нъ бы́ти. Прошꙋ́ тѧ ᲂу҆каза́ти ꙗ҆зы́къ:'
    )
    o(
      'da',
      'da.js',
      0,
      'Denne websides sprog kunne ikke bestemmes. Angiv venligst sprog:'
    )
    o('bn', 'bn.js', 4, '')
    o(
      'de',
      'de.js',
      0,
      'Die Sprache dieser Webseite konnte nicht automatisch bestimmt werden. Bitte Sprache angeben:'
    )
    o('el', 'el-monoton.js', 6, '')
    o('el-monoton', 'el-monoton.js', 6, '')
    o('el-polyton', 'el-polyton.js', 6, '')
    o(
      'en',
      'en-us.js',
      0,
      'The language of this website could not be determined automatically. Please indicate the main language:'
    )
    o(
      'en-gb',
      'en-gb.js',
      0,
      'The language of this website could not be determined automatically. Please indicate the main language:'
    )
    o(
      'en-us',
      'en-us.js',
      0,
      'The language of this website could not be determined automatically. Please indicate the main language:'
    )
    o(
      'eo',
      'eo.js',
      0,
      'La lingvo de ĉi tiu retpaĝo ne rekoneblas aŭtomate. Bonvolu indiki ĝian ĉeflingvon:'
    )
    o(
      'es',
      'es.js',
      0,
      'El idioma del sitio no pudo determinarse autom%E1ticamente. Por favor, indique el idioma principal:'
    )
    o(
      'et',
      'et.js',
      0,
      'Veebilehe keele tuvastamine ebaõnnestus, palun valige kasutatud keel:'
    )
    o(
      'fi',
      'fi.js',
      0,
      'Sivun kielt%E4 ei tunnistettu automaattisesti. M%E4%E4rit%E4 sivun p%E4%E4kieli:'
    )
    o(
      'fr',
      'fr.js',
      0,
      'La langue de ce site n%u2019a pas pu %EAtre d%E9termin%E9e automatiquement. Veuillez indiquer une langue, s.v.p.%A0:'
    )
    o(
      'ga',
      'ga.js',
      0,
      'Níorbh fhéidir teanga an tsuímh a fháil go huathoibríoch. Cuir isteach príomhtheanga an tsuímh:'
    )
    o('grc', 'grc.js', 6, '')
    o('gu', 'gu.js', 7, '')
    o('hi', 'hi.js', 5, '')
    o(
      'hu',
      'hu.js',
      0,
      'A weboldal nyelvét nem sikerült automatikusan megállapítani. Kérem adja meg a nyelvet:'
    )
    o(
      'hy',
      'hy.js',
      3,
      'Չհաջողվեց հայտնաբերել այս կայքի լեզուն։ Խնդրում ենք նշեք հիմնական լեզուն՝'
    )
    o(
      'it',
      'it.js',
      0,
      'Lingua del sito sconosciuta. Indicare una lingua, per favore:'
    )
    o('ka', 'ka.js', 16, '')
    o(
      'kn',
      'kn.js',
      8,
      'ಜಾಲ ತಾಣದ ಭಾಷೆಯನ್ನು ನಿರ್ಧರಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮುಖ್ಯ ಭಾಷೆಯನ್ನು ಸೂಚಿಸಿ:'
    )
    o('la', 'la.js', 0, '')
    o(
      'lt',
      'lt.js',
      0,
      'Nepavyko automatiškai nustatyti šios svetainės kalbos. Prašome įvesti kalbą:'
    )
    o(
      'lv',
      'lv.js',
      0,
      'Šīs lapas valodu nevarēja noteikt automātiski. Lūdzu norādiet pamata valodu:'
    )
    o(
      'ml',
      'ml.js',
      10,
      'ഈ വെ%u0D2C%u0D4D%u200Cസൈറ്റിന്റെ ഭാഷ കണ്ടുപിടിയ്ക്കാ%u0D28%u0D4D%u200D കഴിഞ്ഞില്ല. ഭാഷ ഏതാണെന്നു തിരഞ്ഞെടുക്കുക:'
    )
    o(
      'nb',
      'nb-no.js',
      0,
      'Nettstedets språk kunne ikke finnes automatisk. Vennligst oppgi språk:'
    )
    o(
      'no',
      'nb-no.js',
      0,
      'Nettstedets språk kunne ikke finnes automatisk. Vennligst oppgi språk:'
    )
    o(
      'nb-no',
      'nb-no.js',
      0,
      'Nettstedets språk kunne ikke finnes automatisk. Vennligst oppgi språk:'
    )
    o(
      'nl',
      'nl.js',
      0,
      'De taal van deze website kan niet automatisch worden bepaald. Geef de hoofdtaal op:'
    )
    o('or', 'or.js', 11, '')
    o('pa', 'pa.js', 13, '')
    o(
      'pl',
      'pl.js',
      0,
      'Języka tej strony nie można ustalić automatycznie. Proszę wskazać język:'
    )
    o(
      'pt',
      'pt.js',
      0,
      'A língua deste site não pôde ser determinada automaticamente. Por favor indique a língua principal:'
    )
    o(
      'ru',
      'ru.js',
      1,
      'Язык этого сайта не может быть определен автоматически. Пожалуйста укажите язык:'
    )
    o('sk', 'sk.js', 0, '')
    o(
      'sl',
      'sl.js',
      0,
      'Jezika te spletne strani ni bilo mogoče samodejno določiti. Prosim navedite jezik:'
    )
    o(
      'sr-cyrl',
      'sr-cyrl.js',
      1,
      'Језик овог сајта није детектован аутоматски. Молим вас наведите језик:'
    )
    o(
      'sr-latn',
      'sr-latn.js',
      0,
      'Jezika te spletne strani ni bilo mogoče samodejno določiti. Prosim navedite jezik:'
    )
    o(
      'sv',
      'sv.js',
      0,
      'Spr%E5ket p%E5 den h%E4r webbplatsen kunde inte avg%F6ras automatiskt. V%E4nligen ange:'
    )
    o('ta', 'ta.js', 14, '')
    o('te', 'te.js', 15, '')
    o(
      'tr',
      'tr.js',
      0,
      'Bu web sitesinin dili otomatik olarak tespit edilememiştir. Lütfen dökümanın dilini seçiniz%A0:'
    )
    o(
      'uk',
      'uk.js',
      1,
      'Мова цього веб-сайту не може бути визначена автоматично. Будь ласка, вкажіть головну мову:'
    )
    o(
      'ro',
      'ro.js',
      0,
      'Limba acestui sit nu a putut fi determinată automat. Alege limba principală:'
    )

    return r
  })()

  var locality = (function getLocality () {
    var r = {
      isBookmarklet: false,
      basePath: '//mnater.github.io/Hyphenator/',
      isLocal: false
    }
    var fullPath
    function getBasePath (path) {
      if (!path) {
        return r.basePath
      }
      return path.substring(0, path.lastIndexOf('/') + 1)
    }
    function findCurrentScript () {
      var scripts = contextWindow.document.getElementsByTagName('script')
      var num = scripts.length - 1
      var currScript
      var src
      while (num >= 0) {
        currScript = scripts[num]
        if (
          (currScript.src || currScript.hasAttribute('src')) &&
          currScript.src.indexOf('Hyphenator') !== -1
        ) {
          src = currScript.src
          break
        }
        num -= 1
      }
      return src
    }
    if (!!document.currentScript) {
      fullPath = document.currentScript.src
    } else {
      fullPath = findCurrentScript()
    }
    r.basePath = getBasePath(fullPath)
    if (fullPath && fullPath.indexOf('bm=true') !== -1) {
      r.isBookmarklet = true
    }
    if (window.location.href.indexOf(r.basePath) !== -1) {
      r.isLocal = true
    }
    return r
  })()

  var basePath = locality.basePath

  var isLocal = locality.isLocal

  var documentLoaded = false

  var persistentConfig = false

  var doFrames = false

  var dontHyphenate = {
    video: true,
    audio: true,
    script: true,
    code: true,
    pre: true,
    img: true,
    br: true,
    samp: true,
    kbd: true,
    var: true,
    abbr: true,
    acronym: true,
    sub: true,
    sup: true,
    button: true,
    option: true,
    label: true,
    textarea: true,
    input: true,
    math: true,
    svg: true,
    style: true
  }

  var enableCache = true

  var storageType = 'local'

  var storage

  var enableReducedPatternSet = false

  var enableRemoteLoading = true

  var displayToggleBox = false

  var onError = function (e) {
    window.alert('Hyphenator.js says:\n\nAn Error occurred:\n' + e.message)
  }

  var onWarning = function (e) {
    window.console.log(e.message)
  }

  function createElem (tagname, context) {
    context = context || contextWindow
    var el
    if (window.document.createElementNS) {
      el = context.document.createElementNS(
        'http://www.w3.org/1999/xhtml',
        tagname
      )
    } else if (window.document.createElement) {
      el = context.document.createElement(tagname)
    }
    return el
  }

  function forEachKey (o, f) {
    var k
    if (Object.hasOwnProperty('keys')) {
      Object.keys(o).forEach(f)
    } else {
      for (k in o) {
        if (o.hasOwnProperty(k)) {
          f(k)
        }
      }
    }
  }

  var css3 = false

  function css3_gethsupport () {
    var support = false,
      supportedBrowserLangs = {},
      property = '',
      checkLangSupport,
      createLangSupportChecker = function (prefix) {
        var testStrings = [
            //latin: 0
            'aabbccddeeffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyzz',
            //cyrillic: 1
            'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
            //arabic: 2
            'أبتثجحخدذرزسشصضطظعغفقكلمنهوي',
            //armenian: 3
            'աբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցւփքօֆ',
            //bengali: 4
            'ঁংঃঅআইঈউঊঋঌএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ়ঽািীুূৃৄেৈোৌ্ৎৗড়ঢ়য়ৠৡৢৣ',
            //devangari: 5
            'ँंःअआइईउऊऋऌएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलळवशषसहऽािीुूृॄेैोौ्॒॑ॠॡॢॣ',
            //greek: 6
            'αβγδεζηθικλμνξοπρσςτυφχψω',
            //gujarati: 7
            'બહઅઆઇઈઉઊઋૠએઐઓઔાિીુૂૃૄૢૣેૈોૌકખગઘઙચછજઝઞટઠડઢણતથદધનપફસભમયરલળવશષ',
            //kannada: 8
            'ಂಃಅಆಇಈಉಊಋಌಎಏಐಒಓಔಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಱಲಳವಶಷಸಹಽಾಿೀುೂೃೄೆೇೈೊೋೌ್ೕೖೞೠೡ',
            //lao: 9
            'ກຂຄງຈຊຍດຕຖທນບປຜຝພຟມຢຣລວສຫອຮະັາິີຶືຸູົຼເແໂໃໄ່້໊໋ໜໝ',
            //malayalam: 10
            'ംഃഅആഇഈഉഊഋഌഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരറലളഴവശഷസഹാിീുൂൃെേൈൊോൌ്ൗൠൡൺൻർൽൾൿ',
            //oriya: 11
            'ଁଂଃଅଆଇଈଉଊଋଌଏଐଓଔକଖଗଘଙଚଛଜଝଞଟଠଡଢଣତଥଦଧନପଫବଭମଯରଲଳଵଶଷସହାିୀୁୂୃେୈୋୌ୍ୗୠୡ',
            //persian: 12
            'أبتثجحخدذرزسشصضطظعغفقكلمنهوي',
            //punjabi: 13
            'ਁਂਃਅਆਇਈਉਊਏਐਓਔਕਖਗਘਙਚਛਜਝਞਟਠਡਢਣਤਥਦਧਨਪਫਬਭਮਯਰਲਲ਼ਵਸ਼ਸਹਾਿੀੁੂੇੈੋੌ੍ੰੱ',
            //tamil: 14
            'ஃஅஆஇஈஉஊஎஏஐஒஓஔகஙசஜஞடணதநனபமயரறலளழவஷஸஹாிீுூெேைொோௌ்ௗ',
            //telugu: 15
            'ఁంఃఅఆఇఈఉఊఋఌఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరఱలళవశషసహాిీుూృౄెేైొోౌ్ౕౖౠౡ',
            //georgian: 16
            'აიერთხტუფბლდნვკწსგზმქყშჩცძჭჯოღპჟჰ'
          ],
          f = function (lang) {
            var shadow,
              computedHeight,
              bdy,
              r = false

            //check if lang has already been tested
            if (supportedBrowserLangs.hasOwnProperty(lang)) {
              r = supportedBrowserLangs[lang]
            } else if (supportedLangs.hasOwnProperty(lang)) {
              //create and append shadow-test-element
              bdy = window.document.getElementsByTagName('body')[0]
              shadow = createElem('div', window)
              shadow.id = 'Hyphenator_LanguageChecker'
              shadow.style.width = '5em'
              shadow.style.padding = '0'
              shadow.style.border = 'none'
              shadow.style[prefix] = 'auto'
              shadow.style.hyphens = 'auto'
              shadow.style.fontSize = '12px'
              shadow.style.lineHeight = '12px'
              shadow.style.wordWrap = 'normal'
              shadow.style.wordBreak = 'normal'
              shadow.style.visibility = 'hidden'
              shadow.lang = lang
              shadow.style['-webkit-locale'] = '"' + lang + '"'
              shadow.innerHTML = testStrings[supportedLangs[lang].script]
              bdy.appendChild(shadow)
              //measure its height
              computedHeight = shadow.offsetHeight
              //remove shadow element
              bdy.removeChild(shadow)
              r = !!(computedHeight > 12)
              supportedBrowserLangs[lang] = r
            } else {
              r = false
            }
            return r
          }
        return f
      },
      s

    if (window.getComputedStyle) {
      s = window.getComputedStyle(
        window.document.getElementsByTagName('body')[0],
        null
      )
      if (s.hyphens !== undefined) {
        support = true
        property = 'hyphens'
        checkLangSupport = createLangSupportChecker('hyphens')
      } else if (s['-webkit-hyphens'] !== undefined) {
        support = true
        property = '-webkit-hyphens'
        checkLangSupport = createLangSupportChecker('-webkit-hyphens')
      } else if (s.MozHyphens !== undefined) {
        support = true
        property = '-moz-hyphens'
        checkLangSupport = createLangSupportChecker('MozHyphens')
      } else if (s['-ms-hyphens'] !== undefined) {
        support = true
        property = '-ms-hyphens'
        checkLangSupport = createLangSupportChecker('-ms-hyphens')
      }
    } //else we just return the initial values because ancient browsers don"t support css3 anyway

    return {
      support: support,
      property: property,
      supportedBrowserLangs: supportedBrowserLangs,
      checkLangSupport: checkLangSupport
    }
  }

  var css3_h9n

  var hyphenateClass = 'hyphenate'

  var urlHyphenateClass = 'urlhyphenate'

  var classPrefix = 'Hyphenator' + Math.round(Math.random() * 1000)

  var hideClass = classPrefix + 'hide'

  var hideClassRegExp = new RegExp('\\s?\\b' + hideClass + '\\b', 'g')

  var unhideClass = classPrefix + 'unhide'

  var unhideClassRegExp = new RegExp('\\s?\\b' + unhideClass + '\\b', 'g')

  var css3hyphenateClass = classPrefix + 'css3hyphenate'

  var css3hyphenateClassHandle

  var dontHyphenateClass = 'donthyphenate'

  var min = 6

  var leftmin = 0

  var rightmin = 0

  var compound = 'auto'

  var orphanControl = 1

  var isBookmarklet = locality.isBookmarklet

  var mainLanguage = null

  var defaultLanguage = ''

  var elements = (function () {

    var makeElement = function (element) {
        return {

          element: element,

          hyphenated: false,

          treated: false
        }
      },

      makeElementCollection = function () {

        var counters = [0, 0],

          list = {},

          add = function (el, lang) {
            var elo = makeElement(el)
            if (!list.hasOwnProperty(lang)) {
              list[lang] = []
            }
            list[lang].push(elo)
            counters[0] += 1
            return elo
          },

          each = function (fn) {
            forEachKey(list, function (k) {
              if (fn.length === 2) {
                fn(k, list[k])
              } else {
                fn(list[k])
              }
            })
          }

        return {
          counters: counters,
          list: list,
          add: add,
          each: each
        }
      }
    return makeElementCollection()
  })()

  var exceptions = {}

  var docLanguages = {}

  var url =
    '(?:\\w*://)?(?:(?:\\w*:)?(?:\\w*)@)?(?:(?:(?:[\\d]{1,3}\\.){3}(?:[\\d]{1,3}))|(?:(?:www\\.|[a-zA-Z]\\.)?[a-zA-Z0-9\\-]+(?:\\.[a-z]{2,})+))(?::\\d*)?(?:/[\\w#!:\\.?\\+=&%@!\\-]*)*'
  //            protocoll     usr     pwd                    ip                             or                       host                        tld          port               path

  var mail = '[\\w-\\.]+@[\\w\\.]+'

  var zeroWidthSpace = (function () {
    var zws,
      ua = window.navigator.userAgent.toLowerCase()
    zws = String.fromCharCode(8203) //Unicode zero width space
    if (ua.indexOf('msie 6') !== -1) {
      zws = '' //IE6 doesn"t support zws
    }
    if (ua.indexOf('opera') !== -1 && ua.indexOf('version/10.00') !== -1) {
      zws = '' //opera 10 on XP doesn"t support zws
    }
    return zws
  })()

  var onBeforeWordHyphenation = function (word) {
    return word
  }

  var onAfterWordHyphenation = function (word) {
    return word
  }

  var onHyphenationDone = function (context) {
    return context
  }

  var selectorFunction = false

  function flattenNodeList (nl) {
    var parentElements = [],
      i = 1,
      j = 0,
      isParent = true

    parentElements.push(nl[0]) //add the first item, since this is always an parent

    while (i < nl.length) {
      //cycle through nodeList
      while (j < parentElements.length) {
        //cycle through parentElements
        if (parentElements[j].contains(nl[i])) {
          isParent = false
          break
        }
        j += 1
      }
      if (isParent) {
        parentElements.push(nl[i])
      }
      isParent = true
      i += 1
    }

    return parentElements
  }

  function mySelectorFunction (hyphenateClass) {
    var tmp,
      el = [],
      i = 0
    if (window.document.getElementsByClassName) {
      el = contextWindow.document.getElementsByClassName(hyphenateClass)
    } else if (window.document.querySelectorAll) {
      el = contextWindow.document.querySelectorAll('.' + hyphenateClass)
    } else {
      tmp = contextWindow.document.getElementsByTagName('*')
      while (i < tmp.length) {
        if (
          tmp[i].className.indexOf(hyphenateClass) !== -1 &&
          tmp[i].className.indexOf(dontHyphenateClass) === -1
        ) {
          el.push(tmp[i])
        }
        i += 1
      }
    }
    return el
  }

  function selectElements () {
    var elems
    if (selectorFunction) {
      elems = selectorFunction()
    } else {
      elems = mySelectorFunction(hyphenateClass)
    }
    if (elems.length !== 0) {
      elems = flattenNodeList(elems)
    }
    return elems
  }

  var intermediateState = 'hidden'

  var unhide = 'wait'

  var CSSEditors = []

  function makeCSSEdit (w) {
    w = w || window
    var doc = w.document,

      sheet = (function () {
        var i = 0,
          l = doc.styleSheets.length,
          s,
          element,
          r = false
        while (i < l) {
          s = doc.styleSheets[i]
          try {
            if (!!s.cssRules) {
              r = s
              break
            }
          } catch (ignore) {}
          i += 1
        }
        if (r === false) {
          element = doc.createElement('style')
          element.type = 'text/css'
          doc.getElementsByTagName('head')[0].appendChild(element)
          r = doc.styleSheets[doc.styleSheets.length - 1]
        }
        return r
      })(),

      changes = [],

      findRule = function (sel) {
        var s,
          rule,
          sheets = w.document.styleSheets,
          rules,
          i = 0,
          j = 0,
          r = false
        while (i < sheets.length) {
          s = sheets[i]
          try {
            //FF has issues here with external CSS (s.o.p)
            if (!!s.cssRules) {
              rules = s.cssRules
            } else if (!!s.rules) {
              // IE < 9
              rules = s.rules
            }
          } catch (ignore) {}
          if (!!rules && !!rules.length) {
            while (j < rules.length) {
              rule = rules[j]
              if (rule.selectorText === sel) {
                r = {
                  index: j,
                  rule: rule
                }
              }
              j += 1
            }
          }
          i += 1
        }
        return r
      },

      addRule = function (sel, rulesStr) {
        var i, r
        if (!!sheet.insertRule) {
          if (!!sheet.cssRules) {
            i = sheet.cssRules.length
          } else {
            i = 0
          }
          r = sheet.insertRule(sel + '{' + rulesStr + '}', i)
        } else if (!!sheet.addRule) {
          // IE < 9
          if (!!sheet.rules) {
            i = sheet.rules.length
          } else {
            i = 0
          }
          sheet.addRule(sel, rulesStr, i)
          r = i
        }
        return r
      },

      removeRule = function (sheet, index) {
        if (sheet.deleteRule) {
          sheet.deleteRule(index)
        } else {
          // IE < 9
          sheet.removeRule(index)
        }
      }

    return {

      setRule: function (sel, rulesString) {
        var i, existingRule, cssText
        existingRule = findRule(sel)
        if (!!existingRule) {
          if (!!existingRule.rule.cssText) {
            cssText = existingRule.rule.cssText
          } else {
            // IE < 9
            cssText = existingRule.rule.style.cssText.toLowerCase()
          }
          if (cssText !== sel + ' { ' + rulesString + ' }') {
            //cssText of the found rule is not uniquely selector + rulesString,
            if (cssText.indexOf(rulesString) !== -1) {
              //maybe there are other rules or IE < 9
              //clear existing def
              existingRule.rule.style.visibility = ''
            }
            //add rule and register for later removal
            i = addRule(sel, rulesString)
            changes.push({ sheet: sheet, index: i })
          }
        } else {
          i = addRule(sel, rulesString)
          changes.push({ sheet: sheet, index: i })
        }
      },

      clearChanges: function () {
        var change = changes.pop()
        while (!!change) {
          removeRule(change.sheet, change.index)
          change = changes.pop()
        }
      }
    }
  }

  var hyphen = String.fromCharCode(173)

  var urlhyphen = zeroWidthSpace

  function hyphenateURL (url) {
    var tmp = url.replace(/([:\/.?#&\-_,;!@]+)/gi, '$&' + urlhyphen),
      parts = tmp.split(urlhyphen),
      i = 0
    while (i < parts.length) {
      if (parts[i].length > 2 * min) {
        parts[i] = parts[i].replace(/(\w{3})(\w)/gi, '$1' + urlhyphen + '$2')
      }
      i += 1
    }
    if (parts[parts.length - 1] === '') {
      parts.pop()
    }
    return parts.join(urlhyphen)
  }

  var safeCopy = true

  var zeroTimeOut = (function () {
    if (window.postMessage && window.addEventListener) {
      return (function () {
        var timeouts = [],
          msg = 'Hyphenator_zeroTimeOut_message',
          setZeroTimeOut = function (fn) {
            timeouts.push(fn)
            window.postMessage(msg, '*')
          },
          handleMessage = function (event) {
            if (event.source === window && event.data === msg) {
              event.stopPropagation()
              if (timeouts.length > 0) {
                //var efn = timeouts.shift();
                //efn();
                timeouts.shift()()
              }
            }
          }
        window.addEventListener('message', handleMessage, true)
        return setZeroTimeOut
      })()
    }
    return function (fn) {
      window.setTimeout(fn, 0)
    }
  })()

  var hyphRunFor = {}

  function removeHyphenationFromElement (el) {
    var h,
      u,
      i = 0,
      n
    //escape hyphen
    if ('.\\+*?[^]$(){}=!<>|:-'.indexOf(hyphen) !== -1) {
      h = '\\' + hyphen
    } else {
      h = hyphen
    }
    //escape hyphen
    if ('.\\+*?[^]$(){}=!<>|:-'.indexOf(urlhyphen) !== -1) {
      u = '\\' + urlhyphen
    } else {
      u = urlhyphen
    }
    n = el.childNodes[i]
    while (!!n) {
      if (n.nodeType === 3) {
        n.data = n.data.replace(new RegExp(h, 'g'), '')
        n.data = n.data.replace(new RegExp(u, 'g'), '')
      } else if (n.nodeType === 1) {
        removeHyphenationFromElement(n)
      }
      i += 1
      n = el.childNodes[i]
    }
  }

  var copy = (function () {
    var factory = function () {
      var registeredElements = []
      var oncopyHandler = function (e) {
        e = e || window.event
        var shadow,
          selection,
          range,
          rangeShadow,
          restore,
          target = e.target || e.srcElement,
          currDoc = target.ownerDocument,
          bdy = currDoc.getElementsByTagName('body')[0],
          targetWindow = currDoc.defaultView || currDoc.parentWindow
        if (target.tagName && dontHyphenate[target.tagName.toLowerCase()]) {
          //Safari needs this
          return
        }
        //create a hidden shadow element
        shadow = currDoc.createElement('div')
        shadow.style.color = window.getComputedStyle
          ? targetWindow.getComputedStyle(bdy, null).backgroundColor
          : '#FFFFFF'
        shadow.style.fontSize = '0px'
        bdy.appendChild(shadow)
        if (!!window.getSelection) {
          //FF3, Webkit, IE9
          selection = targetWindow.getSelection()
          range = selection.getRangeAt(0)
          shadow.appendChild(range.cloneContents())
          removeHyphenationFromElement(shadow)
          selection.selectAllChildren(shadow)
          restore = function () {
            shadow.parentNode.removeChild(shadow)
            selection.removeAllRanges() //IE9 needs that
            selection.addRange(range)
          }
        } else {
          // IE<9
          selection = targetWindow.document.selection
          range = selection.createRange()
          shadow.innerHTML = range.htmlText
          removeHyphenationFromElement(shadow)
          rangeShadow = bdy.createTextRange()
          rangeShadow.moveToElementText(shadow)
          rangeShadow.select()
          restore = function () {
            shadow.parentNode.removeChild(shadow)
            if (range.text !== '') {
              range.select()
            }
          }
        }
        zeroTimeOut(restore)
      }
      var removeOnCopy = function () {
        var i = registeredElements.length - 1
        while (i >= 0) {
          if (window.removeEventListener) {
            registeredElements[i].removeEventListener(
              'copy',
              oncopyHandler,
              true
            )
          } else {
            registeredElements[i].detachEvent('oncopy', oncopyHandler)
          }
          i -= 1
        }
      }
      var reactivateOnCopy = function () {
        var i = registeredElements.length - 1
        while (i >= 0) {
          if (window.addEventListener) {
            registeredElements[i].addEventListener('copy', oncopyHandler, true)
          } else {
            registeredElements[i].attachEvent('oncopy', oncopyHandler)
          }
          i -= 1
        }
      }
      var registerOnCopy = function (el) {
        registeredElements.push(el)
        if (window.addEventListener) {
          el.addEventListener('copy', oncopyHandler, true)
        } else {
          el.attachEvent('oncopy', oncopyHandler)
        }
      }
      return {
        oncopyHandler: oncopyHandler,
        removeOnCopy: removeOnCopy,
        registerOnCopy: registerOnCopy,
        reactivateOnCopy: reactivateOnCopy
      }
    }
    return safeCopy ? factory() : false
  })()

  function runWhenLoaded (w, f) {
    var toplevel,
      add = window.document.addEventListener
        ? 'addEventListener'
        : 'attachEvent',
      rem = window.document.addEventListener
        ? 'removeEventListener'
        : 'detachEvent',
      pre = window.document.addEventListener ? '' : 'on'

    function init (context) {
      if (hyphRunFor[context.location.href]) {
        onWarning(
          new Error(
            'Warning: multiple execution of Hyphenator.run() – This may slow down the script!'
          )
        )
      }
      contextWindow = context || window
      f()
      hyphRunFor[contextWindow.location.href] = true
    }

    function doScrollCheck () {
      try {
        // If IE is used, use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        w.document.documentElement.doScroll('left')
      } catch (ignore) {
        window.setTimeout(doScrollCheck, 1)
        return
      }
      //maybe modern IE fired DOMContentLoaded
      if (!hyphRunFor[w.location.href]) {
        documentLoaded = true
        init(w)
      }
    }

    function doOnEvent (e) {
      var i = 0,
        fl,
        haveAccess
      if (
        !!e &&
        e.type === 'readystatechange' &&
        w.document.readyState !== 'interactive' &&
        w.document.readyState !== 'complete'
      ) {
        return
      }

      //DOM is ready/interactive, but frames may not be loaded yet!
      //cleanup events
      w.document[rem](pre + 'DOMContentLoaded', doOnEvent, false)
      w.document[rem](pre + 'readystatechange', doOnEvent, false)

      //check frames
      fl = w.frames.length
      if (fl === 0 || !doFrames) {
        //there are no frames!
        //cleanup events
        w[rem](pre + 'load', doOnEvent, false)
        documentLoaded = true
        init(w)
      } else if (doFrames && fl > 0) {
        //we have frames, so wait for onload and then initiate runWhenLoaded recursevly for each frame:
        if (!!e && e.type === 'load') {
          //cleanup events
          w[rem](pre + 'load', doOnEvent, false)
          while (i < fl) {
            haveAccess = undefined
            //try catch isn"t enough for webkit
            try {
              //opera throws only on document.toString-access
              haveAccess = w.frames[i].document.toString()
            } catch (ignore) {
              haveAccess = undefined
            }
            if (!!haveAccess) {
              runWhenLoaded(w.frames[i], f)
            }
            i += 1
          }
          init(w)
        }
      }
    }

    if (documentLoaded || w.document.readyState === 'complete') {
      //Hyphenator has run already (documentLoaded is true) or
      //it has been loaded after onLoad
      documentLoaded = true
      doOnEvent({ type: 'load' })
    } else {
      //register events
      w.document[add](pre + 'DOMContentLoaded', doOnEvent, false)
      w.document[add](pre + 'readystatechange', doOnEvent, false)
      w[add](pre + 'load', doOnEvent, false)
      toplevel = false
      try {
        toplevel = !window.frameElement
      } catch (ignore) {}
      if (toplevel && w.document.documentElement.doScroll) {
        doScrollCheck() //calls init()
      }
    }
  }

  function getLang (el, fallback) {
    try {
      return !!el.getAttribute('lang')
        ? el.getAttribute('lang').toLowerCase()
        : !!el.getAttribute('xml:lang')
        ? el.getAttribute('xml:lang').toLowerCase()
        : el.tagName.toLowerCase() !== 'html'
        ? getLang(el.parentNode, fallback)
        : fallback
        ? mainLanguage
        : null
    } catch (ignore) {
      return fallback ? mainLanguage : null
    }
  }

  function autoSetMainLanguage (w) {
    w = w || contextWindow
    var el = w.document.getElementsByTagName('html')[0],
      m = w.document.getElementsByTagName('meta'),
      i = 0,
      getLangFromUser = function () {
        var text = ''
        var ul = ''
        var languageHint = (function () {
          var r = ''
          forEachKey(supportedLangs, function (k) {
            r += k + ', '
          })
          r = r.substring(0, r.length - 2)
          return r
        })()
        ul = window.navigator.language || window.navigator.userLanguage
        ul = ul.substring(0, 2)
        if (!!supportedLangs[ul] && supportedLangs[ul].prompt !== '') {
          text = supportedLangs[ul].prompt
        } else {
          text = supportedLangs.en.prompt
        }
        text += ' (ISO 639-1)\n\n' + languageHint
        return window.prompt(window.unescape(text), ul).toLowerCase()
      }
    mainLanguage = getLang(el, false)
    if (!mainLanguage) {
      while (i < m.length) {
        //<meta http-equiv = "content-language" content="xy">
        if (
          !!m[i].getAttribute('http-equiv') &&
          m[i].getAttribute('http-equiv').toLowerCase() === 'content-language'
        ) {
          mainLanguage = m[i].getAttribute('content').toLowerCase()
        }
        //<meta name = "DC.Language" content="xy">
        if (
          !!m[i].getAttribute('name') &&
          m[i].getAttribute('name').toLowerCase() === 'dc.language'
        ) {
          mainLanguage = m[i].getAttribute('content').toLowerCase()
        }
        //<meta name = "language" content = "xy">
        if (
          !!m[i].getAttribute('name') &&
          m[i].getAttribute('name').toLowerCase() === 'language'
        ) {
          mainLanguage = m[i].getAttribute('content').toLowerCase()
        }
        i += 1
      }
    }
    //get lang for frame from enclosing document
    if (!mainLanguage && doFrames && !!contextWindow.frameElement) {
      autoSetMainLanguage(window.parent)
    }
    //fallback to defaultLang if set
    if (!mainLanguage && defaultLanguage !== '') {
      mainLanguage = defaultLanguage
    }
    //ask user for lang
    if (!mainLanguage) {
      mainLanguage = getLangFromUser()
    }
    el.lang = mainLanguage
  }

  function gatherDocumentInfos () {
    var elToProcess,
      urlhyphenEls,
      tmp,
      i = 0

    function process (el, pLang, isChild) {
      var n,
        j = 0,
        hyphenate = true,
        eLang,
        useCSS3 = function () {
          css3hyphenateClassHandle = makeCSSEdit(contextWindow)
          css3hyphenateClassHandle.setRule(
            '.' + css3hyphenateClass,
            css3_h9n.property + ': auto;'
          )
          css3hyphenateClassHandle.setRule(
            '.' + dontHyphenateClass,
            css3_h9n.property + ': manual;'
          )
          if (eLang !== pLang && css3_h9n.property.indexOf('webkit') !== -1) {
            css3hyphenateClassHandle.setRule(
              '.' + css3hyphenateClass,
              '-webkit-locale : ' + eLang + ';'
            )
          }
          el.className = el.className + ' ' + css3hyphenateClass
        },
        useHyphenator = function () {
          //quick fix for test111.html
          //better: weight elements
          if (isBookmarklet && eLang !== mainLanguage) {
            return
          }
          if (supportedLangs.hasOwnProperty(eLang)) {
            docLanguages[eLang] = true
          } else {
            if (supportedLangs.hasOwnProperty(eLang.split('-')[0])) {
              //try subtag
              eLang = eLang.split('-')[0]
              docLanguages[eLang] = true
            } else if (!isBookmarklet) {
              hyphenate = false
              onError(
                new Error('Language "' + eLang + '" is not yet supported.')
              )
            }
          }
          if (hyphenate) {
            if (intermediateState === 'hidden') {
              el.className = el.className + ' ' + hideClass
            }
            elements.add(el, eLang)
          }
        }
      isChild = isChild || false
      if (el.lang && typeof el.lang === 'string') {
        eLang = el.lang.toLowerCase() //copy attribute-lang to internal eLang
      } else if (!!pLang && pLang !== '') {
        eLang = pLang.toLowerCase()
      } else {
        eLang = getLang(el, true)
      }

      if (!isChild) {
        if (css3 && css3_h9n.support && !!css3_h9n.checkLangSupport(eLang)) {
          useCSS3()
        } else {
          if (safeCopy) {
            copy.registerOnCopy(el)
          }
          useHyphenator()
        }
      } else {
        if (eLang !== pLang) {
          if (css3 && css3_h9n.support && !!css3_h9n.checkLangSupport(eLang)) {
            useCSS3()
          } else {
            useHyphenator()
          }
        } else {
          if (!css3 || !css3_h9n.support || !css3_h9n.checkLangSupport(eLang)) {
            useHyphenator()
          } // else do nothing
        }
      }
      n = el.childNodes[j]
      while (!!n) {
        if (
          n.nodeType === 1 &&
          !dontHyphenate[n.nodeName.toLowerCase()] &&
          n.className.indexOf(dontHyphenateClass) === -1 &&
          n.className.indexOf(urlHyphenateClass) === -1 &&
          !elToProcess[n]
        ) {
          process(n, eLang, true)
        }
        j += 1
        n = el.childNodes[j]
      }
    }
    function processUrlStyled (el) {
      var n,
        j = 0

      n = el.childNodes[j]
      while (!!n) {
        if (
          n.nodeType === 1 &&
          !dontHyphenate[n.nodeName.toLowerCase()] &&
          n.className.indexOf(dontHyphenateClass) === -1 &&
          n.className.indexOf(hyphenateClass) === -1 &&
          !urlhyphenEls[n]
        ) {
          processUrlStyled(n)
        } else if (n.nodeType === 3) {
          if (safeCopy) {
            copy.registerOnCopy(n.parentNode)
          }
          //n.data = hyphenateURL(n.data);
          elements.add(n.parentNode, 'urlstyled')
        }
        j += 1
        n = el.childNodes[j]
      }
    }

    if (css3) {
      css3_h9n = css3_gethsupport()
    }
    if (isBookmarklet) {
      elToProcess = contextWindow.document.getElementsByTagName('body')[0]
      process(elToProcess, mainLanguage, false)
    } else {
      if (!css3 && intermediateState === 'hidden') {
        CSSEditors.push(makeCSSEdit(contextWindow))
        CSSEditors[CSSEditors.length - 1].setRule(
          '.' + hyphenateClass,
          'visibility: hidden;'
        )
        CSSEditors[CSSEditors.length - 1].setRule(
          '.' + hideClass,
          'visibility: hidden;'
        )
        CSSEditors[CSSEditors.length - 1].setRule(
          '.' + unhideClass,
          'visibility: visible;'
        )
      }
      elToProcess = selectElements()
      tmp = elToProcess[i]
      while (!!tmp) {
        process(tmp, '', false)
        i += 1
        tmp = elToProcess[i]
      }

      urlhyphenEls = mySelectorFunction(urlHyphenateClass)
      i = 0
      tmp = urlhyphenEls[i]
      while (!!tmp) {
        processUrlStyled(tmp)
        i += 1
        tmp = urlhyphenEls[i]
      }
    }
    if (elements.counters[0] === 0) {
      //nothing to hyphenate or all hyphenated by css3
      i = 0
      while (i < CSSEditors.length) {
        CSSEditors[i].clearChanges()
        i += 1
      }
      onHyphenationDone(contextWindow.location.href)
    }
  }

  function makeCharMap () {
    var int2code = [],
      code2int = {},
      add = function (newValue) {
        if (!code2int[newValue]) {
          int2code.push(newValue)
          code2int[newValue] = int2code.length - 1
        }
      }
    return {
      int2code: int2code,
      code2int: code2int,
      add: add
    }
  }

  function makeValueStore (len) {
    var indexes = (function () {
        var arr
        if (Object.prototype.hasOwnProperty.call(window, 'Uint32Array')) {
          //IE<9 doesn"t have window.hasOwnProperty (host object)
          arr = new window.Uint32Array(3)
          arr[0] = 1 //start position of a value set
          arr[1] = 1 //next index
          arr[2] = 1 //last index with a significant value
        } else {
          arr = [1, 1, 1]
        }
        return arr
      })(),
      keys = (function () {
        var i, r
        if (Object.prototype.hasOwnProperty.call(window, 'Uint8Array')) {
          //IE<9 doesn"t have window.hasOwnProperty (host object)
          return new window.Uint8Array(len)
        }
        r = []
        r.length = len
        i = r.length - 1
        while (i >= 0) {
          r[i] = 0
          i -= 1
        }
        return r
      })(),
      add = function (p) {
        keys[indexes[1]] = p
        indexes[2] = indexes[1]
        indexes[1] += 1
      },
      add0 = function () {
        //just do a step, since array is initialized with zeroes
        indexes[1] += 1
      },
      finalize = function () {
        var start = indexes[0]
        keys[indexes[2] + 1] = 255 //mark end of pattern
        indexes[0] = indexes[2] + 2
        indexes[1] = indexes[0]
        return start
      }
    return {
      keys: keys,
      add: add,
      add0: add0,
      finalize: finalize
    }
  }

  function convertPatternsToArray (lo) {
    var trieNextEmptyRow = 0,
      i,
      charMapc2i,
      valueStore,
      indexedTrie,
      trieRowLength,
      extract = function (patternSizeInt, patterns) {
        var charPos = 0,
          charCode = 0,
          mappedCharCode = 0,
          rowStart = 0,
          nextRowStart = 0,
          prevWasDigit = false
        while (charPos < patterns.length) {
          charCode = patterns.charCodeAt(charPos)
          if ((charPos + 1) % patternSizeInt !== 0) {
            //more to come…
            if (charCode <= 57 && charCode >= 49) {
              //charCode is a digit
              valueStore.add(charCode - 48)
              prevWasDigit = true
            } else {
              //charCode is alphabetical
              if (!prevWasDigit) {
                valueStore.add0()
              }
              prevWasDigit = false
              if (nextRowStart === -1) {
                nextRowStart = trieNextEmptyRow + trieRowLength
                trieNextEmptyRow = nextRowStart
                indexedTrie[rowStart + mappedCharCode * 2] = nextRowStart
              }
              mappedCharCode = charMapc2i[charCode]
              rowStart = nextRowStart
              nextRowStart = indexedTrie[rowStart + mappedCharCode * 2]
              if (nextRowStart === 0) {
                indexedTrie[rowStart + mappedCharCode * 2] = -1
                nextRowStart = -1
              }
            }
          } else {
            //last part of pattern
            if (charCode <= 57 && charCode >= 49) {
              //the last charCode is a digit
              valueStore.add(charCode - 48)
              indexedTrie[
                rowStart + mappedCharCode * 2 + 1
              ] = valueStore.finalize()
            } else {
              //the last charCode is alphabetical
              if (!prevWasDigit) {
                valueStore.add0()
              }
              valueStore.add0()
              if (nextRowStart === -1) {
                nextRowStart = trieNextEmptyRow + trieRowLength
                trieNextEmptyRow = nextRowStart
                indexedTrie[rowStart + mappedCharCode * 2] = nextRowStart
              }
              mappedCharCode = charMapc2i[charCode]
              rowStart = nextRowStart
              if (indexedTrie[rowStart + mappedCharCode * 2] === 0) {
                indexedTrie[rowStart + mappedCharCode * 2] = -1
              }
              indexedTrie[
                rowStart + mappedCharCode * 2 + 1
              ] = valueStore.finalize()
            }
            rowStart = 0
            nextRowStart = 0
            prevWasDigit = false
          }
          charPos += 1
        }
      } /*,
            prettyPrintIndexedTrie = function (rowLength) {
                var s = "0: ",
                    idx;
                for (idx = 0; idx < indexedTrie.length; idx += 1) {
                    s += indexedTrie[idx];
                    s += ",";
                    if ((idx + 1) % rowLength === 0) {
                        s += "\n" + (idx + 1) + ": ";
                    }
                }
                console.log(s);
            };*/

    lo.charMap = makeCharMap()
    i = 0
    while (i < lo.patternChars.length) {
      lo.charMap.add(lo.patternChars.charCodeAt(i))
      i += 1
    }
    charMapc2i = lo.charMap.code2int

    valueStore = makeValueStore(lo.valueStoreLength)
    lo.valueStore = valueStore

    if (Object.prototype.hasOwnProperty.call(window, 'Int32Array')) {
      //IE<9 doesn"t have window.hasOwnProperty (host object)
      lo.indexedTrie = new window.Int32Array(lo.patternArrayLength * 2)
    } else {
      lo.indexedTrie = []
      lo.indexedTrie.length = lo.patternArrayLength * 2
      i = lo.indexedTrie.length - 1
      while (i >= 0) {
        lo.indexedTrie[i] = 0
        i -= 1
      }
    }
    indexedTrie = lo.indexedTrie
    trieRowLength = lo.charMap.int2code.length * 2

    forEachKey(lo.patterns, function (i) {
      extract(parseInt(i, 10), lo.patterns[i])
    })
    //prettyPrintIndexedTrie(lo.charMap.int2code.length * 2);
  }

  function recreatePattern (pattern, nodePoints) {
    var r = [],
      c = pattern.split(''),
      i = 0
    while (i <= c.length) {
      if (nodePoints[i] && nodePoints[i] !== 0) {
        r.push(nodePoints[i])
      }
      if (c[i]) {
        r.push(c[i])
      }
      i += 1
    }
    return r.join('')
  }

  function convertExceptionsToObject (exc) {
    var w = exc.split(', '),
      r = {},
      i = 0,
      l = w.length,
      key
    while (i < l) {
      key = w[i].replace(/-/g, '')
      if (!r.hasOwnProperty(key)) {
        r[key] = w[i]
      }
      i += 1
    }
    return r
  }

  function loadPatterns (lang, cb) {
    var location,
      xhr,
      head,
      script,
      done = false
    function getXHRforIElt6 () {
      try {
        //IE>=5
        xhr = new window.ActiveXObject('Msxml2.XMLHTTP')
      } catch (ignore) {
        xhr = null
      }
    }
    function getXHRforIElt10 () {
      try {
        //IE>=6
        xhr = new window.ActiveXObject('Microsoft.XMLHTTP')
      } catch (ignore) {
        getXHRforIElt6()
      }
    }
    if (supportedLangs.hasOwnProperty(lang) && !Hyphenator.languages[lang]) {
      location = basePath + 'patterns/' + supportedLangs[lang].file
    } else {
      return
    }
    if (isLocal && !isBookmarklet) {
      //check if "location" is available:
      xhr = null
      try {
        // Mozilla, Opera, Safari and Internet Explorer (ab v7)
        xhr = new window.XMLHttpRequest()
      } catch (ignore) {
        getXHRforIElt10()
      }

      if (xhr) {
        xhr.open('HEAD', location, true)
        xhr.setRequestHeader('Cache-Control', 'no-cache')
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 2) {
            if (xhr.status >= 400) {
              onError(new Error('Could not load\n' + location))
              delete docLanguages[lang]
              return
            }
            xhr.abort()
          }
        }
        xhr.send(null)
      }
    }
    if (createElem) {
      head = window.document.getElementsByTagName('head').item(0)
      script = createElem('script', window)
      script.src = location
      script.type = 'text/javascript'
      script.charset = 'utf8'
      script.onreadystatechange = function () {
        if (
          !done &&
          (!script.readyState ||
            script.readyState === 'loaded' ||
            script.readyState === 'complete')
        ) {
          done = true

          cb()

          // Handle memory leak in IE
          script.onreadystatechange = null
          script.onload = null
          if (head && script.parentNode) {
            head.removeChild(script)
          }
        }
      }
      script.onload = script.onreadystatechange
      head.appendChild(script)
    }
  }

  function createWordRegExp (lang) {
    var lo = Hyphenator.languages[lang],
      wrd = ''
    if (String.prototype.normalize) {
      wrd =
        '[\\w' +
        lo.specialChars +
        lo.specialChars.normalize('NFD') +
        hyphen +
        String.fromCharCode(8204) +
        '-]{' +
        min +
        ',}(?!:\\/\\/)'
    } else {
      wrd =
        '[\\w' +
        lo.specialChars +
        hyphen +
        String.fromCharCode(8204) +
        '-]{' +
        min +
        ',}(?!:\\/\\/)'
    }
    return wrd
  }

  function prepareLanguagesObj (lang) {
    var lo = Hyphenator.languages[lang]

    if (!lo.prepared) {
      if (enableCache) {
        lo.cache = {}
        //Export
        //lo["cache"] = lo.cache;
      }
      if (enableReducedPatternSet) {
        lo.redPatSet = {}
      }
      if (leftmin > lo.leftmin) {
        lo.leftmin = leftmin
      }
      if (rightmin > lo.rightmin) {
        lo.rightmin = rightmin
      }
      //add exceptions from the pattern file to the local "exceptions"-obj
      if (lo.hasOwnProperty('exceptions')) {
        Hyphenator.addExceptions(lang, lo.exceptions)
        delete lo.exceptions
      }
      //copy global exceptions to the language specific exceptions
      if (exceptions.hasOwnProperty('global')) {
        if (exceptions.hasOwnProperty(lang)) {
          exceptions[lang] += ', ' + exceptions.global
        } else {
          exceptions[lang] = exceptions.global
        }
      }
      //move exceptions from the the local "exceptions"-obj to the "language"-object
      if (exceptions.hasOwnProperty(lang)) {
        lo.exceptions = convertExceptionsToObject(exceptions[lang])
        delete exceptions[lang]
      } else {
        lo.exceptions = {}
      }
      convertPatternsToArray(lo)
      lo.genRegExp = new RegExp(
        '(' + createWordRegExp(lang) + ')|(' + url + ')|(' + mail + ')',
        'gi'
      )
      lo.prepared = true
    }
  }

  function prepare (callback) {
    var tmp1

    function languagesLoaded () {
      forEachKey(docLanguages, function (l) {
        if (Hyphenator.languages.hasOwnProperty(l)) {
          delete docLanguages[l]
          if (!!storage) {
            storage.setItem(l, window.JSON.stringify(Hyphenator.languages[l]))
          }
          prepareLanguagesObj(l)
          callback(l)
        }
      })
    }

    if (!enableRemoteLoading) {
      forEachKey(Hyphenator.languages, function (lang) {
        prepareLanguagesObj(lang)
      })
      callback('*')
      return
    }
    callback('urlstyled')
    // get all languages that are used and preload the patterns
    forEachKey(docLanguages, function (lang) {
      if (!!storage && storage.test(lang)) {
        Hyphenator.languages[lang] = window.JSON.parse(storage.getItem(lang))
        prepareLanguagesObj(lang)
        if (exceptions.hasOwnProperty('global')) {
          tmp1 = convertExceptionsToObject(exceptions.global)
          forEachKey(tmp1, function (tmp2) {
            Hyphenator.languages[lang].exceptions[tmp2] = tmp1[tmp2]
          })
        }
        //Replace exceptions since they may have been changed:
        if (exceptions.hasOwnProperty(lang)) {
          tmp1 = convertExceptionsToObject(exceptions[lang])
          forEachKey(tmp1, function (tmp2) {
            Hyphenator.languages[lang].exceptions[tmp2] = tmp1[tmp2]
          })
          delete exceptions[lang]
        }
        //Replace genRegExp since it may have been changed:
        Hyphenator.languages[lang].genRegExp = new RegExp(
          '(' + createWordRegExp(lang) + ')|(' + url + ')|(' + mail + ')',
          'gi'
        )
        if (enableCache) {
          if (!Hyphenator.languages[lang].cache) {
            Hyphenator.languages[lang].cache = {}
          }
        }
        delete docLanguages[lang]
        callback(lang)
      } else {
        loadPatterns(lang, languagesLoaded)
      }
    })
    //call languagesLoaded in case language has been loaded manually
    //and remoteLoading is on (onload won"t fire)
    languagesLoaded()
  }

  var toggleBox = function () {
    var bdy,
      myTextNode,
      text = Hyphenator.doHyphenation ? 'Hy-phen-a-tion' : 'Hyphenation',
      myBox = contextWindow.document.getElementById('HyphenatorToggleBox')
    if (!!myBox) {
      myBox.firstChild.data = text
    } else {
      bdy = contextWindow.document.getElementsByTagName('body')[0]
      myBox = createElem('div', contextWindow)
      myBox.setAttribute('id', 'HyphenatorToggleBox')
      myBox.setAttribute('class', dontHyphenateClass)
      myTextNode = contextWindow.document.createTextNode(text)
      myBox.appendChild(myTextNode)
      myBox.onclick = Hyphenator.toggleHyphenation
      myBox.style.position = 'absolute'
      myBox.style.top = '0px'
      myBox.style.right = '0px'
      myBox.style.zIndex = '1000'
      myBox.style.margin = '0'
      myBox.style.backgroundColor = '#AAAAAA'
      myBox.style.color = '#FFFFFF'
      myBox.style.font = '6pt Arial'
      myBox.style.letterSpacing = '0.2em'
      myBox.style.padding = '3px'
      myBox.style.cursor = 'pointer'
      myBox.style.WebkitBorderBottomLeftRadius = '4px'
      myBox.style.MozBorderRadiusBottomleft = '4px'
      myBox.style.borderBottomLeftRadius = '4px'
      bdy.appendChild(myBox)
    }
  }

  function doCharSubst (loCharSubst, w) {
    var r = w
    forEachKey(loCharSubst, function (subst) {
      r = r.replace(new RegExp(subst, 'g'), loCharSubst[subst])
    })
    return r
  }

  var wwAsMappedCharCodeStore = (function () {
    if (Object.prototype.hasOwnProperty.call(window, 'Int32Array')) {
      return new window.Int32Array(64)
    }
    return []
  })()

  var wwhpStore = (function () {
    var r
    if (Object.prototype.hasOwnProperty.call(window, 'Uint8Array')) {
      r = new window.Uint8Array(64)
    } else {
      r = []
    }
    return r
  })()

  function hyphenateCompound (lo, lang, word) {
    var hw,
      parts,
      i = 0
    switch (compound) {
      case 'auto':
        parts = word.split('-')
        while (i < parts.length) {
          if (parts[i].length >= min) {
            parts[i] = hyphenateWord(lo, lang, parts[i])
          }
          i += 1
        }
        hw = parts.join('-')
        break
      case 'all':
        parts = word.split('-')
        while (i < parts.length) {
          if (parts[i].length >= min) {
            parts[i] = hyphenateWord(lo, lang, parts[i])
          }
          i += 1
        }
        hw = parts.join('-' + zeroWidthSpace)
        break
      case 'hyphen':
        hw = word.replace('-', '-' + zeroWidthSpace)
        break
      default:
        onError(
          new Error(
            'Hyphenator.settings: compound setting "' +
              compound +
              '" not known.'
          )
        )
    }
    return hw
  }

  function hyphenateWord (lo, lang, word) {
    var pattern = '',
      ww,
      wwlen,
      wwhp = wwhpStore,
      pstart = 0,
      plen,
      hp,
      hpc,
      wordLength = word.length,
      hw = '',
      charMap = lo.charMap.code2int,
      charCode,
      mappedCharCode,
      row = 0,
      link = 0,
      value = 0,
      values,
      indexedTrie = lo.indexedTrie,
      valueStore = lo.valueStore.keys,
      wwAsMappedCharCode = wwAsMappedCharCodeStore
    word = onBeforeWordHyphenation(word, lang)
    if (word === '') {
      hw = ''
    } else if (enableCache && lo.cache && lo.cache.hasOwnProperty(word)) {
      //the word is in the cache
      hw = lo.cache[word]
    } else if (word.indexOf(hyphen) !== -1) {
      //word already contains shy; -> leave at it is!
      hw = word
    } else if (lo.exceptions.hasOwnProperty(word)) {
      //the word is in the exceptions list
      hw = lo.exceptions[word].replace(/-/g, hyphen)
    } else if (word.indexOf('-') !== -1) {
      hw = hyphenateCompound(lo, lang, word)
    } else {
      ww = word.toLowerCase()
      if (String.prototype.normalize) {
        ww = ww.normalize('NFC')
      }
      if (lo.hasOwnProperty('charSubstitution')) {
        ww = doCharSubst(lo.charSubstitution, ww)
      }
      if (word.indexOf("'") !== -1) {
        ww = ww.replace(/'/g, '’') //replace APOSTROPHE with RIGHT SINGLE QUOTATION MARK (since the latter is used in the patterns)
      }
      ww = '_' + ww + '_'
      wwlen = ww.length
      //prepare wwhp and wwAsMappedCharCode
      while (pstart < wwlen) {
        wwhp[pstart] = 0
        charCode = ww.charCodeAt(pstart)
        wwAsMappedCharCode[pstart] = charMap.hasOwnProperty(charCode)
          ? charMap[charCode]
          : -1
        pstart += 1
      }
      //get hyphenation points for all substrings
      pstart = 0
      while (pstart < wwlen) {
        row = 0
        pattern = ''
        plen = pstart
        while (plen < wwlen) {
          mappedCharCode = wwAsMappedCharCode[plen]
          if (mappedCharCode === -1) {
            break
          }
          if (enableReducedPatternSet) {
            pattern += ww.charAt(plen)
          }
          link = indexedTrie[row + mappedCharCode * 2]
          value = indexedTrie[row + mappedCharCode * 2 + 1]
          if (value > 0) {
            hpc = 0
            hp = valueStore[value + hpc]
            while (hp !== 255) {
              if (hp > wwhp[pstart + hpc]) {
                wwhp[pstart + hpc] = hp
              }
              hpc += 1
              hp = valueStore[value + hpc]
            }
            if (enableReducedPatternSet) {
              if (!lo.redPatSet) {
                lo.redPatSet = {}
              }
              if (valueStore.subarray) {
                values = valueStore.subarray(value, value + hpc)
              } else {
                values = valueStore.slice(value, value + hpc)
              }
              lo.redPatSet[pattern] = recreatePattern(pattern, values)
            }
          }
          if (link > 0) {
            row = link
          } else {
            break
          }
          plen += 1
        }
        pstart += 1
      }
      //create hyphenated word
      hp = 0
      while (hp < wordLength) {
        if (
          hp >= lo.leftmin &&
          hp <= wordLength - lo.rightmin &&
          wwhp[hp + 1] % 2 !== 0
        ) {
          hw += hyphen + word.charAt(hp)
        } else {
          hw += word.charAt(hp)
        }
        hp += 1
      }
    }
    hw = onAfterWordHyphenation(hw, lang)
    if (enableCache) {
      //put the word in the cache
      lo.cache[word] = hw
    }
    return hw
  }

  function checkIfAllDone () {
    var allDone = true,
      i = 0,
      doclist = {}
    elements.each(function (ellist) {
      var j = 0,
        l = ellist.length
      while (j < l) {
        allDone = allDone && ellist[j].hyphenated
        if (!doclist.hasOwnProperty(ellist[j].element.baseURI)) {
          doclist[ellist[j].element.ownerDocument.location.href] = true
        }
        doclist[ellist[j].element.ownerDocument.location.href] =
          doclist[ellist[j].element.ownerDocument.location.href] &&
          ellist[j].hyphenated
        j += 1
      }
    })
    if (allDone) {
      if (intermediateState === 'hidden' && unhide === 'progressive') {
        elements.each(function (ellist) {
          var j = 0,
            l = ellist.length,
            el
          while (j < l) {
            el = ellist[j].element
            el.className = el.className.replace(unhideClassRegExp, '')
            if (el.className === '') {
              el.removeAttribute('class')
            }
            j += 1
          }
        })
      }
      while (i < CSSEditors.length) {
        CSSEditors[i].clearChanges()
        i += 1
      }
      forEachKey(doclist, function (doc) {
        onHyphenationDone(doc)
      })
      if (!!storage && storage.deferred.length > 0) {
        i = 0
        while (i < storage.deferred.length) {
          storage.deferred[i].call()
          i += 1
        }
        storage.deferred = []
      }
    }
  }

  function controlOrphans (
    ignore,
    leadingWhiteSpace,
    lastWord,
    trailingWhiteSpace
  ) {
    var h = hyphen
    //escape hyphen
    if ('.\\+*?[^]$(){}=!<>|:-'.indexOf(hyphen) !== -1) {
      h = '\\' + hyphen
    } else {
      h = hyphen
    }
    if (orphanControl === 3 && leadingWhiteSpace === ' ') {
      leadingWhiteSpace = String.fromCharCode(160)
    }
    return (
      leadingWhiteSpace +
      lastWord.replace(new RegExp(h + '|' + zeroWidthSpace, 'g'), '') +
      trailingWhiteSpace
    )
  }

  function hyphenateElement (lang, elo) {
    var el = elo.element,
      hyphenate,
      n,
      i,
      lo
    if (lang === 'urlstyled' && Hyphenator.doHyphenation) {
      i = 0
      n = el.childNodes[i]
      while (!!n) {
        if (
          n.nodeType === 3 && //type 3 = #text
          /\S/.test(n.data)
        ) {
          //not just white space
          n.data = hyphenateURL(n.data)
        }
        i += 1
        n = el.childNodes[i]
      }
    } else if (
      Hyphenator.languages.hasOwnProperty(lang) &&
      Hyphenator.doHyphenation
    ) {
      lo = Hyphenator.languages[lang]
      hyphenate = function (match, word, url, mail) {
        var r
        if (!!url || !!mail) {
          r = hyphenateURL(match)
        } else {
          r = hyphenateWord(lo, lang, word)
        }
        return r
      }
      i = 0
      n = el.childNodes[i]
      while (!!n) {
        if (
          n.nodeType === 3 && //type 3 = #text
          /\S/.test(n.data) && //not just white space
          n.data.length >= min
        ) {
          //longer then min
          n.data = n.data.replace(lo.genRegExp, hyphenate)
          if (orphanControl !== 1) {
            //prevent last word from being hyphenated
            n.data = n.data.replace(/(\u0020*)(\S+)(\s*)$/, controlOrphans)
          }
        }
        i += 1
        n = el.childNodes[i]
      }
    }
    if (intermediateState === 'hidden' && unhide === 'wait') {
      el.className = el.className.replace(hideClassRegExp, '')
      if (el.className === '') {
        el.removeAttribute('class')
      }
    }
    if (intermediateState === 'hidden' && unhide === 'progressive') {
      el.className = el.className.replace(hideClassRegExp, ' ' + unhideClass)
    }
    elo.hyphenated = true
    elements.counters[1] += 1
    if (elements.counters[0] <= elements.counters[1]) {
      checkIfAllDone()
    }
  }

  function hyphenateLanguageElements (lang) {
    /*function bind(fun, arg1, arg2) {
            return function () {
                return fun(arg1, arg2);
            };
        }*/
    var i = 0,
      l
    if (lang === '*') {
      elements.each(function (lang, ellist) {
        var j = 0,
          le = ellist.length
        while (j < le) {
          //zeroTimeOut(bind(hyphenateElement, lang, ellist[j]));
          hyphenateElement(lang, ellist[j])
          j += 1
        }
      })
    } else {
      if (elements.list.hasOwnProperty(lang)) {
        l = elements.list[lang].length
        while (i < l) {
          //zeroTimeOut(bind(hyphenateElement, lang, elements.list[lang][i]));
          hyphenateElement(lang, elements.list[lang][i])
          i += 1
        }
      }
    }
  }

  function removeHyphenationFromDocument () {
    elements.each(function (ellist) {
      var i = 0,
        l = ellist.length
      while (i < l) {
        removeHyphenationFromElement(ellist[i].element)
        ellist[i].hyphenated = false
        i += 1
      }
    })
  }

  function createStorage () {
    var s
    function makeStorage (s) {
      var store = s,
        prefix = 'Hyphenator_' + Hyphenator.version + '_',
        deferred = [],
        test = function (name) {
          var val = store.getItem(prefix + name)
          return !!val
        },
        getItem = function (name) {
          return store.getItem(prefix + name)
        },
        setItem = function (name, value) {
          try {
            store.setItem(prefix + name, value)
          } catch (e) {
            onError(e)
          }
        }
      return {
        deferred: deferred,
        test: test,
        getItem: getItem,
        setItem: setItem
      }
    }
    try {
      if (
        storageType !== 'none' &&
        window.JSON !== undefined &&
        window.localStorage !== undefined &&
        window.sessionStorage !== undefined &&
        window.JSON.stringify !== undefined &&
        window.JSON.parse !== undefined
      ) {
        switch (storageType) {
          case 'session':
            s = window.sessionStorage
            break
          case 'local':
            s = window.localStorage
            break
          default:
            s = undefined
        }
        //check for private mode
        s.setItem('storageTest', '1')
        s.removeItem('storageTest')
      }
    } catch (ignore) {
      //FF throws an error if DOM.storage.enabled is set to false
      s = undefined
    }
    if (s) {
      storage = makeStorage(s)
    } else {
      storage = undefined
    }
  }

  function storeConfiguration () {
    if (!storage) {
      return
    }
    var settings = {
      STORED: true,
      classname: hyphenateClass,
      urlclassname: urlHyphenateClass,
      donthyphenateclassname: dontHyphenateClass,
      minwordlength: min,
      hyphenchar: hyphen,
      urlhyphenchar: urlhyphen,
      togglebox: toggleBox,
      displaytogglebox: displayToggleBox,
      remoteloading: enableRemoteLoading,
      enablecache: enableCache,
      enablereducedpatternset: enableReducedPatternSet,
      onhyphenationdonecallback: onHyphenationDone,
      onerrorhandler: onError,
      onwarninghandler: onWarning,
      intermediatestate: intermediateState,
      selectorfunction: selectorFunction || mySelectorFunction,
      safecopy: safeCopy,
      doframes: doFrames,
      storagetype: storageType,
      orphancontrol: orphanControl,
      dohyphenation: Hyphenator.doHyphenation,
      persistentconfig: persistentConfig,
      defaultlanguage: defaultLanguage,
      useCSS3hyphenation: css3,
      unhide: unhide,
      onbeforewordhyphenation: onBeforeWordHyphenation,
      onafterwordhyphenation: onAfterWordHyphenation,
      leftmin: leftmin,
      rightmin: rightmin,
      compound: compound
    }
    storage.setItem('config', window.JSON.stringify(settings))
  }

  function restoreConfiguration () {
    var settings
    if (storage.test('config')) {
      settings = window.JSON.parse(storage.getItem('config'))
      Hyphenator.config(settings)
    }
  }

  var version = '5.3.0'

  var doHyphenation = true

  var languages = {}

  function config (obj) {
    var assert = function (name, type) {
      var r, t
      t = typeof obj[name]
      if (t === type) {
        r = true
      } else {
        onError(
          new Error('Config onError: ' + name + ' must be of type ' + type)
        )
        r = false
      }
      return r
    }

    if (obj.hasOwnProperty('storagetype')) {
      if (assert('storagetype', 'string')) {
        storageType = obj.storagetype
      }
      if (!storage) {
        createStorage()
      }
    }
    if (
      !obj.hasOwnProperty('STORED') &&
      storage &&
      obj.hasOwnProperty('persistentconfig') &&
      obj.persistentconfig === true
    ) {
      restoreConfiguration()
    }

    forEachKey(obj, function (key) {
      switch (key) {
        case 'STORED':
          break
        case 'classname':
          if (assert('classname', 'string')) {
            hyphenateClass = obj[key]
          }
          break
        case 'urlclassname':
          if (assert('urlclassname', 'string')) {
            urlHyphenateClass = obj[key]
          }
          break
        case 'donthyphenateclassname':
          if (assert('donthyphenateclassname', 'string')) {
            dontHyphenateClass = obj[key]
          }
          break
        case 'minwordlength':
          if (assert('minwordlength', 'number')) {
            min = obj[key]
          }
          break
        case 'hyphenchar':
          if (assert('hyphenchar', 'string')) {
            if (obj.hyphenchar === '&shy;') {
              obj.hyphenchar = String.fromCharCode(173)
            }
            hyphen = obj[key]
          }
          break
        case 'urlhyphenchar':
          if (obj.hasOwnProperty('urlhyphenchar')) {
            if (assert('urlhyphenchar', 'string')) {
              urlhyphen = obj[key]
            }
          }
          break
        case 'togglebox':
          if (assert('togglebox', 'function')) {
            toggleBox = obj[key]
          }
          break
        case 'displaytogglebox':
          if (assert('displaytogglebox', 'boolean')) {
            displayToggleBox = obj[key]
          }
          break
        case 'remoteloading':
          if (assert('remoteloading', 'boolean')) {
            enableRemoteLoading = obj[key]
          }
          break
        case 'enablecache':
          if (assert('enablecache', 'boolean')) {
            enableCache = obj[key]
          }
          break
        case 'enablereducedpatternset':
          if (assert('enablereducedpatternset', 'boolean')) {
            enableReducedPatternSet = obj[key]
          }
          break
        case 'onhyphenationdonecallback':
          if (assert('onhyphenationdonecallback', 'function')) {
            onHyphenationDone = obj[key]
          }
          break
        case 'onerrorhandler':
          if (assert('onerrorhandler', 'function')) {
            onError = obj[key]
          }
          break
        case 'onwarninghandler':
          if (assert('onwarninghandler', 'function')) {
            onWarning = obj[key]
          }
          break
        case 'intermediatestate':
          if (assert('intermediatestate', 'string')) {
            intermediateState = obj[key]
          }
          break
        case 'selectorfunction':
          if (assert('selectorfunction', 'function')) {
            selectorFunction = obj[key]
          }
          break
        case 'safecopy':
          if (assert('safecopy', 'boolean')) {
            safeCopy = obj[key]
          }
          break
        case 'doframes':
          if (assert('doframes', 'boolean')) {
            doFrames = obj[key]
          }
          break
        case 'storagetype':
          if (assert('storagetype', 'string')) {
            storageType = obj[key]
          }
          break
        case 'orphancontrol':
          if (assert('orphancontrol', 'number')) {
            orphanControl = obj[key]
          }
          break
        case 'dohyphenation':
          if (assert('dohyphenation', 'boolean')) {
            Hyphenator.doHyphenation = obj[key]
          }
          break
        case 'persistentconfig':
          if (assert('persistentconfig', 'boolean')) {
            persistentConfig = obj[key]
          }
          break
        case 'defaultlanguage':
          if (assert('defaultlanguage', 'string')) {
            defaultLanguage = obj[key]
          }
          break
        case 'useCSS3hyphenation':
          if (assert('useCSS3hyphenation', 'boolean')) {
            css3 = obj[key]
          }
          break
        case 'unhide':
          if (assert('unhide', 'string')) {
            unhide = obj[key]
          }
          break
        case 'onbeforewordhyphenation':
          if (assert('onbeforewordhyphenation', 'function')) {
            onBeforeWordHyphenation = obj[key]
          }
          break
        case 'onafterwordhyphenation':
          if (assert('onafterwordhyphenation', 'function')) {
            onAfterWordHyphenation = obj[key]
          }
          break
        case 'leftmin':
          if (assert('leftmin', 'number')) {
            leftmin = obj[key]
          }
          break
        case 'rightmin':
          if (assert('rightmin', 'number')) {
            rightmin = obj[key]
          }
          break
        case 'compound':
          if (assert('compound', 'string')) {
            compound = obj[key]
          }
          break
        default:
          onError(
            new Error('Hyphenator.config: property ' + key + ' not known.')
          )
      }
    })
    if (storage && persistentConfig) {
      storeConfiguration()
    }
  }

  function run () {

    var process = function () {
      try {
        if (
          contextWindow.document.getElementsByTagName('frameset').length > 0
        ) {
          return //we are in a frameset
        }
        autoSetMainLanguage(undefined)
        gatherDocumentInfos()
        if (displayToggleBox) {
          toggleBox()
        }
        prepare(hyphenateLanguageElements)
      } catch (e) {
        onError(e)
      }
    }

    if (!storage) {
      createStorage()
    }
    runWhenLoaded(window, process)
  }

  function addExceptions (lang, words) {
    if (lang === '') {
      lang = 'global'
    }
    if (exceptions.hasOwnProperty(lang)) {
      exceptions[lang] += ', ' + words
    } else {
      exceptions[lang] = words
    }
  }

  function hyphenate (target, lang) {
    var turnout, n, i, lo
    Hyphenator.languages[lang] = Hyphenator.languages[lang] ?? LANGUAGES
    lo = Hyphenator.languages[lang]
    if (Hyphenator.languages.hasOwnProperty(lang)) {
      if (!lo.prepared) {
        prepareLanguagesObj(lang)
      }
      turnout = function (match, word, url, mail) {
        var r
        if (!!url || !!mail) {
          r = hyphenateURL(match)
        } else {
          r = hyphenateWord(lo, lang, word)
        }
        return r
      }
      if (
        typeof target === 'object' &&
        !(typeof target === 'string' || target.constructor === String)
      ) {
        i = 0
        n = target.childNodes[i]
        while (!!n) {
          if (
            n.nodeType === 3 && //type 3 = #text
            /\S/.test(n.data) && //not just white space
            n.data.length >= min
          ) {
            //longer then min
            n.data = n.data.replace(lo.genRegExp, turnout)
          } else if (n.nodeType === 1) {
            if (n.lang !== '') {
              Hyphenator.hyphenate(n, n.lang)
            } else {
              Hyphenator.hyphenate(n, lang)
            }
          }
          i += 1
          n = target.childNodes[i]
        }
      } else if (typeof target === 'string' || target.constructor === String) {
        return target.replace(lo.genRegExp, turnout)
      }
    } else {
      onError(new Error('Language "' + lang + '" is not loaded.'))
    }
  }

  function getRedPatternSet (lang) {
    return Hyphenator.languages[lang].redPatSet
  }

  function getConfigFromURI () {
    var loc = null,
      re = {},
      jsArray = contextWindow.document.getElementsByTagName('script'),
      i = 0,
      j = 0,
      l = jsArray.length,
      s,
      gp,
      option
    while (i < l) {
      if (!!jsArray[i].getAttribute('src')) {
        loc = jsArray[i].getAttribute('src')
      }
      if (loc && loc.indexOf('Hyphenator.js?') !== -1) {
        s = loc.indexOf('Hyphenator.js?')
        gp = loc.substring(s + 14).split('&')
        while (j < gp.length) {
          option = gp[j].split('=')
          if (option[0] !== 'bm') {
            if (option[1] === 'true') {
              option[1] = true
            } else if (option[1] === 'false') {
              option[1] = false
            } else if (isFinite(option[1])) {
              option[1] = parseInt(option[1], 10)
            }
            if (
              option[0] === 'togglebox' ||
              option[0] === 'onhyphenationdonecallback' ||
              option[0] === 'onerrorhandler' ||
              option[0] === 'selectorfunction' ||
              option[0] === 'onbeforewordhyphenation' ||
              option[0] === 'onafterwordhyphenation'
            ) {
              option[1] = new Function('', option[1])
            }
            re[option[0]] = option[1]
          }
          j += 1
        }
        break
      }
      i += 1
    }
    return re
  }

  function toggleHyphenation () {
    if (Hyphenator.doHyphenation) {
      if (!!css3hyphenateClassHandle) {
        css3hyphenateClassHandle.setRule(
          '.' + css3hyphenateClass,
          css3_h9n.property + ': none;'
        )
      }
      removeHyphenationFromDocument()
      if (safeCopy) {
        copy.removeOnCopy()
      }
      Hyphenator.doHyphenation = false
      storeConfiguration()
      if (displayToggleBox) {
        toggleBox()
      }
    } else {
      if (!!css3hyphenateClassHandle) {
        css3hyphenateClassHandle.setRule(
          '.' + css3hyphenateClass,
          css3_h9n.property + ': auto;'
        )
      }
      Hyphenator.doHyphenation = true
      hyphenateLanguageElements('*')
      if (safeCopy) {
        copy.reactivateOnCopy()
      }
      storeConfiguration()
      if (displayToggleBox) {
        toggleBox()
      }
    }
  }

  return {
    version: version,
    doHyphenation: doHyphenation,
    languages: languages,
    config: config,
    run: run,
    addExceptions: addExceptions,
    hyphenate: hyphenate,
    getRedPatternSet: getRedPatternSet,
    isBookmarklet: isBookmarklet,
    getConfigFromURI: getConfigFromURI,
    toggleHyphenation: toggleHyphenation
  }
})(window);
export default Hyphenator;