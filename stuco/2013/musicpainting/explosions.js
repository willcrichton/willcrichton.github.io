define(function(require) {
    'use strict';

    var NUM_FRAGMENTS = 50;
    var EXPLOSION_RADIUS = 200;
    var string;
    var volumeData;
    var audio = document.getElementsByTagName('audio')[0];
  //  var Ticker;

    function rand() {
        return Math.random() * (2 * EXPLOSION_RADIUS) - EXPLOSION_RADIUS;
    }

    function posRand(min, max) {
	//Return a random number between min and max
        return Math.random() * (max - min) + min;
    }

    function loadMusic() {
        //Couldn't get reading from file working... just hard coded it in lol
        string = "1!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ch^]WVUPPMY^Y^=COWGQA=:79@669=666:,522.2,3.7,-),ZZXZMMSQFLSQPN=6SUabRSJI6:,-,-*)((**\'*&\'))\'(%&&\'\')\')\'(\'(\'\'&(%%$\'$&\\\\QUNOHIKKPQII@@Y[\\[LKKIDELLEE=?<=11/.*($&##\"#\"#\"#\"#\"#\"#\"#\"#\"#\"#[[SSJJII@AJIHG9:OOZZVUED33**))&\'++&(\')&(&\'&\'$%%%&&&&&&%&$$$$##\"\"AE\\]HMJLGGPU@G>BCF_aPMOUPPJMNPLNEHGJAK2726+.+.*,.2-2/4),*.),(,())*YZVVPPLMHILMML@?__Z[ZZ>@10-.))()+.(+*-(**,&\'&&%&\'(\'\'\'\'&&%%%&$$#$ZZXYMONNFELLQQ@@UT__ZXMNJHJJLMED>?=<00./%%##\"\"\"\"\"\"\"\"!\"\"\"\"!!\"!!!\"!\"!!!\"!\"!!!!!\"!\"!!!!!!!\"!\"!!!!!\"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!&&iuplwnqocflcdmVNX\\]bJIGD>?:=8<;;55=?BC?A<9?==:B;24]^XXQTOQIILMCDKK]]kf\\eOWQNILKLCDPLTR@A>C>?=A;<999;<=ADGHHBAC=C;<Z[\\ZYXYVORXXXVOKVW`_OOSTMIHIGHAEMLIGKJFFLKONLJKMCCKOCCACA@=C;==;FJZXMLSQMIPKROGGEEZ]_^TRPQKMIIGIBDPLVSKKFDFIFGCD=>[]ecXUPNWTTWTTPMOPRREFHG68785422[^a^W_UWSR^^]\\ONVUQTKJHFA<<<@>@;<:A?EC<DDEDF>BA?TT^]WWTTJIUU[[LKXV``dbURQTNQNVNPIMMMEK::0.-/89<=CC>>@;:A;>??A@<>;?WZ]\\^W\\URO[ZPQONY\\RWLJUX?E;;;942EHDBACIJRSPPPNOOJHIIGD@=>@=>:7;8TRZ]MMMLJKQOPRKHUXfa[[WXMOQWNPRWNNUSVVHG@CGHXWTRLMXWZZ]WNOPTOOPQTTSRNOEJHM=A7633./TUZZWXOTNUXZMOFEEG6653,,(\'&\'((((55254589;<=8@>68[Y[YJKOODDKLHG89eb^]ccT]PXIMGNHLNNOSJK<=7<8=7:7899;7D?EGE@@CAF<CKIZ[[X[_XWZX^__^PS___XY]PVLNKG@B=?AE?=99?=@BCDSSVVSTOMGKLS??FFFKCAZZ_]TSTQOKRTOP@=dda`cf[V\\`X[TZLNUUTZPKGFIGNJKJBBQTKMMMRRPPRRLKLNSUa]GDFEEE787913DE^]]\\]`WWURXVZX\\`WWGC@<**&*$%/00000<=>ACFDILIFIGI]]XYUSZUYXXYZYHJbd_[bfOURS[YZ[_[ORHIDA<<@@FGGGAB>?CE;ADBED<A8:<?UWZWUVY]NRY[Z\\JLTT^]QTY[QNOKFKIGGLJPMJNONPSSSPUSONEHFJDDBEDD787856RSW]SXNRPPWWWVKJc]]\\V[MOIMMPPVKOSUURBDCFONONMNIJZXRWLMOTUTSPXUYUMH[TMMSSDCCDBB<<Z[VYXXXYOOZZUVDDKSIM>B53+*\'%%%$$./,./5/21306070359VWUSKKGDFFKJAA;;[[\\aQ[LINMJNJFDCDE?>32..)*\'(&&&%)\'-0,.,2).(-),\'+U[]\\PQLNGGPQNO=<XXUX=AIJ=;7>4714KE>=A@;;@?AAAA??=;:=;925-1+-*+(-??TUHFGF?@@@FF::TWjgjvolW[R\\W]LOKQ`YTXEFEEIJIFHD?BXXWcTSPQNYRTNSKP_ZQTLIQMB@EC;;;8]^a_Z^^]W[]`Z^IOPTFECD=<:8::98:876<@CF@=9976699:YWXVNNRQWSWXXWGD\\Xkbwplgb^ZiZ[]QVY]SQVJKCHBB8;,/-,20;<=A;<@D?A???;]\\^\\][URTT^]QOLJUUTR@>NOHGLNKQKNSTMNIEKMMPIIBE@?<><?CC?B<>568:68UVPQGGHF;;FFBB33cd|}hi_i^[]^`]NST[WTYYNONLNRNNHJONTYU[ORWVURQTVSMK^`W[SQOMQSJMIKGLchkzuilllnkf`cX_a\\QVDHC@A?=<;<67:>@E@D<J?F>A@?9:_^\\XQSRSDEIJHI99^_a`WZPTNSJNSRNM[VKKBG<B6=7<<;88-/3=?GBM:DAB??<?JQ^]Z]ZZTSUUZ[GLQT\\[TSVPVRLKDECHCDLO@B8<JKSRSTUVMKMMKNLK9A=B98;<;>Z]SVSPQSMKSPJJA@hd]]^_XSRUVTTTLNWUVTUTPQRQPOMNLLVYURVWQUVVZTOWGIRT^_JNTRSWQS>D9:]^bcTXTVMQTYY]LQSVRV@E@AAB9@47470178GPECJMIHKJDD97Z\\XXTUZWRSXWMNED`][aVa[^T_RWQRLMMNQQCG:>:=9B7>6:7;?A>A=?A=@AAE>?ZZ^aUXTYPPXXZWROYZcaZU\\VPMLMJLICEK\\UUXJNPSQQQSHKIJJGEKCI:?:E;A:>>@[[XZVSURRNZWWR>AZYb_WTV_XVW[RTMLY\\\\aNMUZUT`_XUBDPWRQPNFLVUYYVQOORVVOMRQVJQZ^>=AEcfZX[Y\\_KKU[WWIJQVNWAA@D9?4758151369@F:@><<@=B::HE]\\PQONKJFFHHDDHG^^Y\\VRRSYVZWTOAEA?AA33/1*,-0EELLHFJHEJ<C?D:>>B>C`b``[XWVUU^^UVJO\\`[_PUWYEJJPABAEFDGEMJRQXXU\\TRVQONGKAIGBLJ@AEEHDMPY[TXTTTPVXTUSRRR]_Z`T]SRY[]WTOQSRUY]TQPPRSRQSRNOT_WSIJLJQRLMPRJJUTPUDFJNOVGL>Q;=`a__]^\\`Y_^c^^TVW\\O[@BGF<B<>==8=??EP@HAG?=@CBBCF^^\\]]_^^XZ\\[]XLJZX[\\[^LTGKPQVSLMLLBC9:02??DBDHABB@BBEGJMCKDDED>8;;_]]\\[]VTYW[YRTEG]ZZ[V`Y_LEMJJJGFNUORKKUPTYUUVTQQMNJQKQCO8C9>5;:9^[UTONLLKKVYWYJL^]^dg`X]QVXRQXUUUWWYXWUTWWYYLOFHNOTOWXPXLPWTUNOKQUQTUZFHGJOU?BAF=BabRUY^VVUYTVTWVSWWKZ;A989;7831::9<>E392=8=:=<@=A]_VYWWSTJKMKIF8:edceX]KTLLMILJII?D?C8=/2,-(*()\'&)(*./4,1+.*/*2)-WW[ZPPNPFFOORQABPOX[ILMKMGA;9:55<9GKB<9;?>ABABDC=>9;;=3:-1*.)/*/++WPQOHJGE>?DF=@B>j_whej^aY\\UZQTOQYYUTPONRPPOLPOTR[YQSZZ_^YWZ[YSTU]ZRVPNSOIKPVBE@B__`\\]_W^OKXVZZOJTO[WB>JI=@>=<A9@7:37OQHKGIKPED>DCF_bYTUTVQRRMOMPMLkdgcxiae^c_a[XPVVRIRDGBC=>:3/1/068?<GA<<B?B?F?;;@=EBCCDD===?CB?F;8AFDGMNJNIIBDBFDEB@@?A:>9**&($%#$01?@AA;:8798898897:7968988796655448798686:59;<:;8<9<9<88+-*,78,,12,,.-1000++,,56;>AFMKQRTTWUZVNMsu{vtx|vv|qpnmooigqnnae^`_fb\\[]Uj^c[c\\UbQJIDNNFA`b_lYPXVWXbaWKHQc^mocj[dX^[_R^NXLH[VU^PYMMHLJRSFGGMPWbXZWORNXR\\S]Ve^aeebb[a]bc[^ROhff\\YVZ_NV`WQUQITV\\_PRUX[QZV_\\NNKO_cj[_ZYW`WX^__bgmhbbb_[`fhOd][XTomhpfkhdfgffa^d_hgbe\\XaXbcW]T^N]akfd[_ad_fc__cb_[jaa\\_b`cZNUMKVEecfafh_`c`b_gYYaaZ[WWNOQQSUKKIJINKYXU\\HPRLKJPVJL[Za_^^ROaWXS\\_ZLb_f`inlf`]Y]Y_W\\RTYQBB;C68112/69IFPTZZ]dXYQ[USXTUPbcec`dZcbb\\^\\\\TSadUgmbX[^^b`V^U[b``h]aQaVX^U\\\\WRchbiTQYXXSKYMM@G^bdifm[]adffHQ@Gpchwidem`igfZ_^aaaffZ^^\\]Ta_]\\ZWg]dokgdbZbZZ`aZZ_[_`[Wbb\\fa`UQH[RIkbrmlieba`c_b``ac_Y[QWWYQURPWRHIWNIQDCD>@@CKGDCB^_acac^YTWVPOQ;Fefeac^`VX[W[ZYTSPGKKPS7C4435510-3<DNOLDHDNEMLMHF^UT[]UPQHDZ\\_\\ELOSje]`_`[Z_U]RSWV`chaeY]V_XXZZWZX]Ve[Z^\\WP\\THMFKNSa_flZba_U^dhX_QVlkvnjggheifhcec\\^ggZ`]]aQVY`XYVS_]finjbc_d`gWQX`dkm]VZV[UU_X=A?:_bdkZgfg^_cZc^P^X_XZTYWLGJFBF:FCYQc[TkabY_[[JMXZT\\a`aafi`_da`_SRRgjknpjddebd`eb\\fb\\X`POMOSOQSL@CB=TLcc_b_`\\`cX]]aXleeiYfg\\mab\\cbO^nffdjofl`ZX]SYTOT`_a^Y_`QW_ZeZ][aY^cYje`\\bMRSQQX]_``Z__bOQCKVSMQ^Vhfhmnmlcffdeg^addfaga^Vk[eY\\QZT[`gfc^g`bddac^c_jki```b_cV]MTRUKX|t~}|trrsjpopvodgkj[`bZb^dRUSPTOX[VQWPVSKWJJLE>>WY_cY`YYTJLUMTKIZZokimlh`c\\dVSYQPRWYWZTXGRUZKRGCOSTQXZRTTMRORLSQOQcg^abaZT\\Zbe]_PP_d`cYS\\^XY[YV[W\\^`dd]XW]UU_VY[PNWa__UY`VSSKOUMXJlafjkdch`d^ZffcZ^eoolkjijg`gbeh]X^af`c_f`c]d\\`]ac]jcgaccf\\e`bgccb`b]^Xhfef]]`]MIBEca_enfaXbdaaY[Z[XZPTQSVURSGFQUHLJJZXMXRKOJLKIMH?TWb_[`^a[Uda_ZUQhiph`cg`b^i^\\TVUP_UJCM9E5;0:2/7:FBTQZW_[SZTQTQWY[\\cd\\_`^SX^^_^Z[WZbhfd_]Z^^ZWYUXZZd`^a[]VUYZ]YRWNZa^\\eXYWULROLDFEMM[ci_biZ_XegfaMLj_hnfn`bhcgdach_eabb^TYS^fa`b^ZWb]]`gZdfaXdZ_`ZZXb[bW__\\c`[XWSLEe[gidkcd`\\_]gfbX``]\\`U[PZRKEWFMM>EH>BKBD?D>F=C?DA@W\\ZZVVYSRPWY\\YLN_`ahje\\]XWY[XUSXONKJAA887526220.<DVX^_HKUQONOIHH[cbf_]VQDC^^]]FHOUad_]_eT[TY[]UUaR]g_c\\_Y[\\Zd]\\XQV_^_g[_ZVQYLGJJPNk_acfg_aWXb[[PGIihhiklbd_fc]YVb^`ccgbc__d`_^]_]_cckhbhddYVcd^eYT\\Z`cZ\\RSUYYO==@=]_`hmdZYfcddX[QT\\[WWRPMNJPJAFEIH_\\maZ_\\_QVVLU\\RYX_ddb]fba_^b`b^YZ_ieoondgk^]c`_\\_T]X\\W[YWSPLOIIEHEXXe[`b[Z][f^bbTadaee^dafihak^bTZfech_]^iZX^XXbSVW[a`^\\__^\\\\^Te\\]\\Yfmik]URXWOPUPYUad_ejbbMMZZ[ZFJaVktgmhceiciclcc_cY`fbQRW_^^SP^WKOh\\gkflel`idVag__hfidmjgadiWbZbY^|~{~}z|tu{q|{qjkkrnmerf_ldf]cgUehbehiWZ]U[NSR`QU\\mdbhnbkeYddcaLO``~xlzowqgqfhaedcW`\\__Q_NVSPNXJG?D\\VQbXaXZU\\V`^aZdxmgei_frcffkd_Tahlkjdh`eTVU__VXU\\cZ^YRUSZ[TW[UUYTecia`efib`W\\V[XY_^\\b]]]OLYWYU:Bidofrjmncmaj_aaf\\Ua`]^NMWU]\\MNNRjpomijbgeZa_ihb]`aef\\fi^^^VWAT?E=Fii^igi`dYaaXcdU]abOQKUOIGKONQ`]Xfcngen]dWa\\naeX^mlnllobeWT\\_aaFWqnjttpzsoecifejlfjja\\Ve`_R\\Z^WT[TYXZfgnf^gid__hlfku{kqsfffbculg^tgvigpmefpdfh`]f]ggdcfZ_[_dgYk\\`^Zhnfnjrjmbldk^f]_acd\\`\\^QcZXZa`U\\ziszkmildbfedw^aehea]\\Z[bV\\^ZO\\_e`upe`ohddgeifbgded`VZf[RPSUMPGHhebaf^hlXZhg^VLOTY^cPQLMHPHNKNJNMKYq\\]QVEPRTHUNNMN^fbhabfc^[^Z]\\ZOiepsqpmkhccf`h^U^\\YZTQMOLYROINOEOTad]dbd]X`\\^X`Xgddmqldig]rkZYEOd]fdg`ekmc`][XXOXZabZ^Z]^T][aZ\\`^Zefhh\\mZaT_]XX\\[ac_bbccSW][h_aYVWiriqmjfehhaoabd^mhWZZQ]Yaefa^_Xcndgie`h`gcaU`ZW[TaLRTUb]GQMNCC><egfeeiY^eb_cLPUU[^Y\\PPJKGGFPFK@LQU`]YaY\\V[^KYOYOfa`eaa]d\\acb`cbahfpytwltkdbbfc_a]l[_bbbUR`OVOOJOCCKMba`\\YgMYfVW`^Ydhdjlk_fbfmf]Ycacfkj_`gaXR]\\Y[WTcbiaaY\\WXX]Z^^Z\\Xbkg\\bch\\bXX`^T`b_baa`a]SR`adcWX^aq~rfq~nspjfiafkhfbX]`_RSZ`WTPWFOihflbfch``hdg`dbdgpkdg`Yd[bbefU_vyxv~~uv|txyuvnlqthoku`af[_W\\_a^zd`b__aWWe[ZXSKK]f_d`ibb[Zae_aJUolxysqhneskkmha\\Z[`^]XZX_[QPRTAFEBQYf]_UWNXQ_VXM^]gimiqc`ciinphfYcifj]pjebW[Xce]bUjdg]fZZR_XZ_SUZW[_aggdT[XcZ\\RUTYX]]Y\\^WPSH^`Y^=CjdltqncrfcbgZX`X^becPSQSOXWSGONMi_ttnh_iadgdeff^ch[kXg]^XRPTFM<OWZjgfiefaZ^YW_\\SWU]^YZ\\VULUKON_SZ_`]^eVx\\dY[Zjada]`igmiob]WZa`\\`Wdmmvprmnhkpmfkkklfelc_d[`dV\\]WV_]VT_\\hb[_YcZ_f_alkjnmskjirlq{pilemoqke_bkibe^`]^\\[\\dbhhgf_d^`c^[agbcaielgg[i\\ea_[[^ca_c^^XQcdaaTVTNjmkkpuhucnpqckj_gce`^T[g__`]WZe_nlronolgnfefbbc\\^`^]e]dd``\\^MOJKei^gbggdYXcebaSL^_JWVPOIWOQC@ISTURjgo`VWTaYSRSOOXSkkrp\\\\hg`]dcYZ^amip{wmlxnkgkefWdb]Y\\QNPTL[OOVVMNLDY``e]dYX\\YZV[[fjicklc^dadakeWgqlviegh_cdghU[WW\\Te]_U[\\VP\\Z\\ZX^VPeadkZmZiX`fa[W]b]b]e^V^]dcdcWXd^kmoqlul\\heksgaddXc_VU`[Pb\\c]ad]ahm^badced`gcdcYY_[`_SPSSY\\OQ@CBEakeedahb`bb^`aQ^Z^SNKF@CHIAMCOMR]^diaccce_Z[ZVZXbbebad\\_hfd_a_[`hkqvstfqfbeq]``f\\d\\[NYUT\\ZQRQIMPPB\\YfX_a\\aTONUTTcXlhe\\dfgg`kighfTViheefkac__\\XZVOXggdbYc`eXX[_X[]U[[cida_`\\e\\aUdU]`cebd_YUWXZ[XYGDb`usjqklmjjgb`_cbiif[YXUYX_fPUKOSVmapklbecaceceal_aebdZbaaYTXZ^[ZYeecck`[ccYbVW^\\^V\\PVQP<BCDLICLOHEGDE?<89041./---TTRQIHJK?=?=8822RR``UU=<32-+**+**,*+))((()\'(\'\'\'&)))(**((\'&\'\'%%%%UURREEGGGG;;88./44QQ@@EEDD886611..--\'\'$$$$################\"#\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"!\"!\"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!)+qr~~wyr~monssp_j^]`fh^YQKJJFEB@@E:NS\\\\CNHDAECC8<>BXZXTONNPFLHKHH<7jd`cZ[[c`VLTRYRNSQVYMUOJEF6:4662EEKIPNLNCFFE<CKFUW_c\\[\\_YVZ\\TVLLVQ^\\OY^XPQWNKOLMLILKRSQPQRVWWSRPTNUOTPIMCG@<::E>FH[]YSYSRSUQWQZQNJa`Z^]dSYUTMKPKIGVVXZQPLLEGFJDB>>TYY_QUSTVTUYVKVSaaVUDKPQRPSV:C:>_g\\__\\[^W[`_^_LQWUSR@G?BMQFDKNNQJODFFL7<==@AKSHHMR_`Z\\\\X_^^_[]XY\\Uefbc]_YVWZKONQJHGKLUJHHMDFFA@CDCIMKPLMEE@><D9D=:XX]]^[YXWW\\VQMQOa]\\WMVXYPMQN[QKHULRNMNPMQRSSWRRVUMSUNRHEB@;D;::6RRTQRQKLIGLJQM@>NO[[]bVVWTXXURVUQW[W\\ZMQRLNOORKMJMWR\\]PSLTRUTUSONR`YY\\NMVT]\\UTEFDGgg^e]\\TPRKWXZVOX[UHFCE=?/511+/259>BH@N79:9:;7986PR\\\\MLLOEFOLPOA?a]fadiXcT]S\\SVQWHMLMBKF@:885695773;:B>@@AFEB@>44?A_\\\\XZZOOSQVWVQKL__[VQUSVKNKHMDGGMVUVJHKLSSVSWTUUOOMOEH@A;@;=?@::WXUWVVMLLKRRNK:9`\\cabc[]VQOPJNFJXWYfSVUWLKNMEBAAQTYZa]OQYZZV[ZWROTa_QPCFABKP9:5:??c`QQUYWT]\\ZWTTUV_WPXRSMHD@@D>D=<DEIPBDCBCEGMEBAAWZ\\ZXWSSPMPNIHC@b_dd^ZUXXZTST\\SMPOQL@D2533,*+-()0-UUJPDEEFDDBBDBZV^\\\\\\UWPPVUZXLHJK__OTYUVTRTJLMGOJYRSNWQQPSOQNSQQKSQRVNFGJEGED8:56TYWSTXNQORWUOPMLb]b]]`WXU[SSXYVSZZYV[[PSUUPTSQLKRTZ^WaYXRYTWRPNOZV^^TRPRERWYIFEJcaZ\\WT^WIIVQRP@AMQJM;;9?3220054427AB?E7>;;9:9:=:69\\_RQNPKKHGHJEA=>bdh`QVNYQSQNRSEIDJBA64540/-,))=;==GCGIBF:?9C:D>HZZ\\Y]^SOPQ][VVJGUW_[GKXUGFCF;>79LHLJLMHJMNPOSQRQPPVQFKEED>@A?CED>=[\\QO\\WQNUPUTLHWOnsukjjaW\\cWX[\\RURUQVSSIKQPMNJLJIWUUWPLJGJNJKGFFEQYXW>?HGILDJ<<44_dY[WYVQKHRQQV><LPDP8<75010/0135=DFDBC==;;<97:77OUXYNMNPEGGFHG55ZWhymhg~_\\g^bU]abZc`WOSXRQNED@=?/2>=E@AA<;69A@::01XX_\\VVPQVW^[XWQRb`_\\NNW\\PRRTLGFIUKOLEGINLNPUNOHIGJOPJKDG@F>@9>79RMY\\RRSSLNUTWUHH_b~vjrjjTPadMLa`[`a_UUTV@@]]UXY^YYb_c\\XVX^UVYZ^]Z[aa]^ZZVYT^SUTOEIlpqorjgeccad_\\IMdZZ]QYHRHJPTTQMQXRKXTYGLTVPMOTJFWWSRJKW[JJIPDNKTed`dbb\\_`ce`X`X\\XZRR\\ZZXUUUUWWJNCINTQTUYUTMRRWMXUS^a\\\\b`YW\\`^aZYLH`_dcSZ]XUZUUEORQY_UOX\\NNW_U_R[HLKRPSYbPSNNRWOHOMWWNQYYSSMLYYUYIJ\\[fg]fZ^YXXSQXQPc]Z^VSQRMRTVS\\ORY]^b][Y]]a\\bRU]YW[_aZYV[RX[TQQPV\\^ghZbe\\_Vb\\[aY]X`a_XVOROPOPUSUUOQW_Y[QWNVLKNOMRMNa^_b[_YWSa_]PWXSdc_dd_TUZX]Xb\\OZSVPQELJKJTEIGEEFCFFVKTUULSCL=E<?OVXXUVTTRRX[Z_OS`ZZ`X\\Zf]TNPRIKUQTWTQYNLUVXSOLMRR\\WT[QMSIMBELAGJBD\\^Z]ZSOI^U^`XWQMgeh`bePS^]TRYRYTSWSTIPRSW_]Z`^PQ]W__X[\\ZSZXZ[W^V^^X[FRZRX]IYQPNQdd[\\^[^_KJ^^[YTRX[QNMUQMIRFODBOOIPMOUVIODMKRESHTHJY]ST[]MPYVMMFIKIa`ec\\^[[]bQVVSRPWYPYNRKSSSLLKLDFHLURS^TWRQMPJQIP`afZ`Z\\V_XYXUWRX_`V[UaPZY\\ONQRHWR[[XYSTTRYPPT`Q^KIRVPQDF>DDDAC@?SVXVbZORDMKNPUBI`[c`_`VbZ`Zb]aZaYZ^^a[[WWUWZ[XXVOY\\^\\cTZPZO]LYRXOXY`ZYKKOLKQFG9777ee`aa]`_]]ab^bTT`\\UQMST\\QZW_NTT[QYTSTRPUPOOSURQV^_]YQX^_UZX]TYOQ]amilh\\^[]YZ[YRPSPMPKKFEAJ<E@?HMCEMUSTMRMQMKPXPQIK^a^aZ`VU`Z__S\\RT[bacX]ZbJVIVIUJJNJPM:@OPRONTRULQTXZZJSRVITIOLPKN`^e`X[OJSYVW^\\JId__\\cg\\_\\\\__\\`^Y[UZW]_Z_WOY^[WWUQS_\\PRSSIE]^Y]_XWU\\[[[TVVZ_gTW@FGJej\\[Z^UYFMZa]]SY[XYVPKVZLRRSNSNQPQRaOQGRAILRFINU^]\\[V]_aQSEIIMFHib__eiFMSYV]RZ\\]TWW\\QYMPLOTTMSNPPO_UITJOPQMPVWTRTU`bU_OKMN]^c`OTZbc^^`SRVUAA;IENMW^ZPUNRKIV[[YOKRXTMUXMOFLEDFGCJBK]aZ^\\[ZXZWX]PPIJa_ygelbldka`Wb\\]bbY^TYKMUY^]Y[XTILRW\\]Z]GIJCHKGIMPOPMWHMRZQSAB9=fgX`VVVUPNX]TQESQNWZCDDFE@<>JLY\\eiig`[S\\ZVRSYXVVJJb`\\Z_]`_YWUWJI<:hdkjtkrh^`bfheTWWbONNOVXNM9@::==IFXVSWKQOUTPPRKN]]`c`_aWMPUTTQGEFDBGBILLHFGHDJFGNGLDJBMDHKHPFNNJJLGNKIHIKNIFJJFKGHNCKFMJOIIEBJFDWFsk~nuda[[YQXXNJUTVQSOXQMNMKLHMJJKMOPJLJPFNHFBJ8:?BBAIETP\\W^RTVQWxqt~xu~ygqs~lorphsjngi`d[W[dUV[[c_[]\\\\HPPNMEPTCF]b`^`VcaUTRYUU=@cdghgc^^dY_aUZTa[SXSUUWVMOZRLKJEISRNbW^YROQZTcSP\\Xedd`ac_ZaY`_aYWP]bnr\\V[gX\\cX[YH[Ucfh`^^XYY[^_`RRNKmg^i^bZ^XS]b[]ghhl`iff[^hga[RLVRhlkkjgkf^dc`]^bdec`_ZRVU^`Y^TO[Ojdc`b[d_bac\\g^eeb`f]SaW\\XZW\\LSOAgggins^bgdad[^T\\bWZ_RIUILIRKFG?<VL\\MURMN>QBDHGDJR[V_faTU^\\^\\`\\QS_^hmjl[bbhdcU`KTKZOP>F><3:710/25DAOMS^[PTXVVJTNRRFfd]bc`XVb]b_\\WRRa\\Zedf`baR]]MWUXcaeba`[W[\\]\\R_T\\S\\^f[__ZXZPIBHAJPZZ`a_b[eadiXQ=<agjpgmphcfgi`Z`\\_h_eX^[Y\\U_]VXZUX]iabf]jhcc^bbT[VZc_\\a]``]b_TRPHT[gcjjkinfecddhc^]acV\\UO]_JUOVQQOERVOMBI?KLBJL>>@>\\abca\\X[WUUSKC>G`glh]_^ZX[PYVZPTROGQDN=<3554/4043=KKOMRNIGDQEJAGY\\^ZMOKKQE^\\\\ZDDVYmhgg\\i[eR]OVX_SOg[WZXXOW^XaX\\WYahX`ZXWXYbTMLFOUQ`gji^Vc_]QfdW[TTimqikte`jfakbb[`\\^^e`_d\\XO]^\\ZSLX]ljddgd_^g^ZWdb^d`_V]TWOU_W??=:c^gb\\[bf[_a_WcEHQXW[GQRRIPOGGK?F[RgjW[\\VTO[PWKUOTRa_\\cfeacgc`gTRZVosodba]be`ba\\_c[^[ZTQURTUMQNMGE?XQcbcbYSUY``[Z]Udgmn\\[Zagcd_b]TZf``g_``kRgX]SZ[P[^`__UUTT\\a^]]P[UY`\\aXWbX^NTWXWU[Rcc`^YSQQONQRCA[Xnlpsbmejc_ndcYa[ec^`WROY_[XUUaPWa[mqcg`ndchaicifcfbe]gb`V`M\\QW[Yuyx~nxwtruo~pnccdld]h^]\\MTVXLRVWVPOU[WYZQZWPJFCAZ`ceV]UWKOTQHHDE`bnlng`]ig`b]URWUNYZZ`cWVPTKTTMFLHKLZlN\\R]P[T\\U_SXf]hdagXT_\\^^X]JRk\\ca]V[aZ_ZULNTWW`a^c]X[]ZZ\\XXJR__aag^YTMMPOOXVOegkhhe_b]b_^b`WVfesjcurs\\cffcdZcX`bfa\\e`]cec[]]]Yaja[bd^_``^ebfca_[^f^i[a_\\UXWGFEEgbukaba_\\dka\\[W\\]^UUQOXQUPCNLPGCNFUPOMKVKWETENLGXX^`Y[^_SY_\\bZXSi]m_kkfaa_X\\XT\\VWQSQ>C;=023--144F@YV]b[Y[Y]QRHSOYYcb]__[ZR]_a^^\\bXljodcbf`XdU]`]TMdg^]Y\\OVQM_RaSPW[]kq`eYUS`TLKDLONW`gZQfgQWec^_JXdhgfejf`ckam]f[fifc^X^cd]Y`ad\\a\\bYcha]gc`\\`X`_\\Vad`cTY_ga_VcKQKL`Znmcdhjaeeg_aZ]fb`bY`UVRPRRVPSWSCBBEHB?F>:A<=E>:AWZV\\OYKLULXXVXPRngjgT^XbQ\\[XTWOVMREHAA68:83336-0?<KP_VTSQRPPNRCG_``eSQTQEGZX_]GIUTcbfcZefXX\\TZaZVW_aX\\_XX[V^XXTXU_f`bbbg[YWUWPNOKSgdlfgi]][[cf\\QLQogpmoi_bbdi`[_Xacebhc^[c_a`d^b]b`ddbg[fd\\Vcge_[^b_gf^UIMTTVQ<<6:`hgic^^ecZgaWSSIZ^WOQUOIKNEGFEQJ[^`a_a\\^P_TYS]MVLY`a^^cg\\__]^_[XXaiehsdo_al`[`gb[Y`^^S]NOQLIMICKBDY\\Z_a`UTW]^]f]Uggeji\\a]e`aiaacSZcggd_ae_YXZ]UZR[c_]\\ZXX^TN[UZ^W`SY]a_bZVR[SLYTQLWZabebc]EGWR[\\ECSNmckhrie`gfdcbfgae`c\\MKRaZ`NPYVHPdekfeeebailheg_cenmffhb`d]^a_e[eyuwiouferjmeaal__f^e_fTYN_Y`]_Y`U_]]VPNOSWXYJIPQ\\`__MWT[MIY[SPOF[_iqfk\\_^_^a\\`]_Y`Y]WYWSUUMSOVTISKQOLTXRXXQOTPNSFPIPSOTITRX^S_NYQV]bWRKOV^O`OOXRRQXHTRTUT[ZQTWNVRM]\\`Zdb]V]]^^W\\T\\YZLQJMNONMNWMKIQ^W[jccW^QSJHLKSL_Y\\][\\bZUX__b]XQY]T\\ZYX[MaSTKONILNRVJRKNCH>D>G<<AD`Zdcdf\\_beacga_c]^QU]cTcYQQWNHIIIIWSaX[U[VY^[VZR_cdeac\\ZRS^`[aQT``flcbdk]YX[]W\\]__]\\[`O\\YgXXSRUQ\\W[ZUTVKLFPIM\\JUST^QRRLPLNONNQNPIJTUSMaQXPUSSONMNUIQPNXPQLRKLMIOVQ`b^\\V[LNZX`Y\\ZUXFLJETOMLGHBKELDI_dca_a_WOWMZKROP\\[[_]ZYSOP\\^]X?JOTNQVTMKFFCDWLRNQSQOJOMNDE;?=>=<C<=B>;7899359152/05602./-.-.,.+/BCbbaaddaab`ac\\^Y_TXWUQO[SRNMS@CG@eceiehekW\\dfTTUXTQSMPLKLGKAICFBG_U`bbba]_^bfah]`WeK[PZOYPKOODJFFYaefb_ad_dc``_WZ[Y]W[TV`P[RRGJ8?]Ui\\`d\\WNPa[ebOY]`\\YLXMTJIGHFG:>AFjca]cjWbUX^`h`Y]^[]UZOUTUYZURHKP\\e\\VPPYZWPUKSOPWNVJPNKFFIKLMJNBG[]`ZVLRRPQ[WQUIDIJ?F>:363020.//2A9XX]c\\YQW[RR^SPdb_Z^\\MQPQVZ\\XOSaUielga[\\`UZVX\\`OK^\\QINZLOMLKG==A?R]da\\a_b_^[TRQOR\\_]ZZaYZYWKOHHFJZJZY^gTYOXW[SXRTcaS]][TIXURN@ECAc_gdSc]W]\\b`^]WUTR]]ZTTRNPPTZNNJb]gre^[]]T`WVYYRXYddYcXMSN[]_aSVSKYeTVNTPTKNOTNPQV_bXVSOTRMKQUDND@xswlnfk`d_eh`d\\\\i]Y\\LWKSDSPbQWTPLPQXOWOORPNPFJEQWPZYWaKHQPZWVZKF`]kbiclY_`\\_PNQ]RNTZ[cUTLVUdRVSRVYR[GQMSSYKEPRTOPK\\OFSEJQUDFESPOMQPWKWIPPOHMGPNRIUYVKTGQIFHRGHHOEQ__cbW[WYSS\\]XUJOIJ=?BF9@FGIG<>9@XXifXZOVVWNRWVUP`^\\\\a\\Wa\\[f^``OUZZ`ZWYTPSWWLMWNVXQWPQLTRKMIOYRO[QS^[^d[\\_bY]_]Z]XaTaW_]WWVUWRUNSEQQRXaVXXT\\QPOWUPS\\W_\\TNXPVX\\_LSQWefde_h[`aaj\\aaY\\VV^XZ\\VOOQJOIMGLEENWRRU\\PQVXQONRSPVUZZTXSRNXMNRX_\\[WXSWRVWQUOMUUTLQKWOQQ[LTSRRWNRP`aW[UV[Y\\`VXTNPTVPB?8B8::567==<?aZ][gZWYNKKPUSQLab^_dea_[acfa[a\\[TVUSVMZNPTIPFIFEABDRKDF;>857348`d^_dbagWR^b\\TaX[[STQLRUFFFCFLJFGNN_ZbXTZQWTSURNWO^aa^YUWZ^\\`\\aaSSg^fae^`_ebd\\YVWXUVOQPDIAKFNLTOONONdaPZJOEHCBC>C@HEEC>AA@=CBEIISNPQO`b`RVQU[MPQHNRUOTSZYMPMOONRQJ^a^\\fXda`a_aba`PVSVX^TURIKGGKCIEFDebj]^`a\\KOGDEBAH]Z[\\_aUTe`a\\VVWYb]U`eW]UUXNZV]SRQQYQVWU[VYXTWWYYgenggd]ebc]Xba^_Xb`YU\\QZVNTQSMYHUQedfcadZP^`\\_QS[WZSUYSZWXVSUOVVZOjcf`ecbb[^gbcW_XZ__TYZSVVVWQQWVVac`ihefb[[d^ZXPV`bXUS]PSYPPPQXPRflbia[`Xem_aZ\\XX\\fj\\^ZSLPPVMYNQLghafdmc`X^__e`WX_]_\\RWYKPMGGFJMF]W]Yaa`YUYVYQYSSb__`ZXSOY[^`[Z]XOM]cZ``_]YaS]OWRRD^S_\\]Od_d\\^^__jcyyxntotyiioleiZijja_TUDPNXEHBDRNKYJRCF@<;:;?<9:;Z[WRROINGEGEJG69b`pj`__^JHPPJLGHCFMQOKLVJKIOOJBAIFEE=?<B;C7;:=@=\\Wb\\RUYYOLZW^aPUWZd]TOSWUWT[KRQROJ][ZTORUP\\TXOUXCJSNFEB=8;26;?GFA?_^]YYX]USOW[TOGFbaog_b`[a][[]aU][`^cY\\[\\[QY^WaV^]\\eaZSQISH]TZVWTWZ`^PQWXQQTVFEBF]```WSYYWZTVSOJINMKO8;::65/,++**10MTMLELECAC=ACEC@a]VVW[UWTVWYOUJKaaia_^bW_\\XYJLCCCH=?670/-0)*(\'25JHHHDE;=@?<E<??;`]Y^_[WYWNZ]X[TQYaadOVXZSSNLKIKLOP][X^PSSLWVVYPMOORZEGA@76::1./.,-WXSWSWKJRSYXOS?@`ZaaTT]_\\\\[\\XXRVfd[aRPRXUX[\\[]V\\_cZ^OUUVWNZU[SYW\\_[[QUXZMV[ZIFLL_aed`_c_[]c[`_QQ^X`]TQIJDEFECAHB6=:>7;<:6::9>?32KPZXQQNKJCLHKLB?PS^[[^SRMNPNJLONADBG=@8:/1,1++)-).9726./,,(+((()\'+]^XVXZGEIMRSLJEE\\_]aWU]]WMRPPTIRRSZYXSVRXUZ]YXTXPPQQVIIIHMFG>@=:aaV[YV`^ST]^UUBFUSabeb]\\[^]Y]\\][\\X__\\[ZXUSZWXU^SSQfa_]QRPNYYYXVYLPYYSROKJKJM@B//64a`]Z]^NMLLTRKIFION?A7686/..,+*75``Z[RSUOKEMPQLUFac```e\\X\\^`^^]SS[Xfdnc``]b^]Z[X]V]SVUWSROJDDFCCG<?YRIJAF98DDFFHHGEkf_`jf^\\ca__XXRRid[b_X[XRN[UMMLPX\\LMJLLLHJGMFF@JKPMFIHJKKIHGLHFIVWRVEA9;55/410,,[^a]^^ONTGONPRKNFRU_68476911-1-0TVUMV[XSTYSTILRTPR]`TZP\\YZ[OWY^[[Rz~~{~~kllftmrh\\_bh`cOWSGKIGJA<KA?H=@IFJM;:?A75:<TYYYVTMOFDIIGGBAcbdcdcZ]WNMOOPGCDIQYSSPTMIGLRSIEEDMM>A<B?B<>><>?]_a]Y[USMJ]U]\\EPYZbaRXX\\VWWSOQMPQUU[TYX\\RRZWXYXWKN^PWUYFCID=KJIMOIagZX]]YVQW[WTWTGi`ibd`f`_XfaYcTZX\\\\``aWTXQ\\]ZTXZc``^`\\S\\YY\\VVZT`U]_XRRSWNV\\YDH;<d^cba`ea]_bZU\\QKVU^[CG;B:<985362;9ULOJHLJKH<A?IFCF^Y^_Y\\PPSWWVUXLNfa]__`[cTVPPKL?ABF>>3712.-(+)*:;LLKGGEB@<=?>A@HCaYXV^VYQRN_]ZZRX[ZacYW^_MJFULPHBIM_ZTTPLMLYVUTSRNRVRNSQGFMEGA88:F9aUTWO^OI[S^ZPGCQb_eiX]Wb^^TYZ`[[bdbcXYUQaZa[]X\\RkkVYSZ^SXVY\\\\U]SZW[VTPX`UYQQDGAGgbfholdhdjbggeXb^e^fTWPRPVKZ[PGH@OLO=C?BAJBBCA36[VPTYRKMEGJIJK55Y\\ca][[XNJJMJNOT?DBG@<2545,/+,+.)-;<05.5,1+/)/(-(,_[XWQSGDJIQOKKAEac^]SU_[MNPXIOMLY^]XSPSOQVUYVWTVQPUSNPKKKLHD9=?B^a_bVT``ILX[TTIJ^Ue]dc__[[c[_WTW__aa\\\\XYRSUZRWUVWUb_[TTQPM[Y]VXVMN^YXYMMKJFG>>./75b`]cga^aUY_XTQNSNN?I?@64332046GEb[]_WWT\\]]LYQ\\NUc_`^^cU^X[_]^_UTd\\geegcbX]\\\\cZ^WSXZXaQTORUIIKNGIJIXeZ`XURRLOXQSLLNZ__TSS[Q]^`\\Z^TNec`^]fZS[XSSLVKQbX\\]YV_`_X^VaXZV\\]ZaN^W[YXPVOOMFYXWWOS\\OMGQGOGIG_iqdsegibaeie\\hcccgbY\\PZZRQRcU__d]mohgeheeeifec\\nbmnjpbbncd^irchfa~v~wzuq~yrmqsygnvmqjjpkbcg_a_belhddb_dX\\`^pb\\VYamogdssikh`cdXaU_xiy}qvptgkh_mad_d_\\bW^a_ZUZQ\\RZTXQ[Yaebeai]`gae_}pinnhnljllphf_g^irjnakiajZ]_^\\i\\`ha`c^g_Sbf_c[a][jefggdk_ca^g_bZhaf[_`b`f_da]OXSXmm~gncnnlacda]efcjc]e]\\ag`c^Z\\Y_gfmnjndggkadabddfgfeh^^e[\\bfWcWRfehcfjegbddgd[Wc[[__^_\\]Z_VVV]^[mdk]dja_Y_nfc``^fappihkgfqdcf\\Xf\\Wltuq~nuiupnetaifia`bYUe]V\\R_KaSUUWilknhcfflfbhamliprllpnmkjjhqgfishsihqjkeqdkjack_hddjfgbfbd`d]\\[eqfgdghkaca_`a`[e_\\b]\\b_ab^bc[VXXkqxmisschnoebb`f]hdi[]Y\\V`[\\`b]ahgjlmacdYafgccff`kbgbb]cY`_eZ_STimdgled\\cg^faaZ__\\^[Wa]aS^\\_VX][Z[hjho\\iX\\YZf[abp`ilgcchfgf`_]^Rfbteirnurqihkjfbgeab__bbX_U`b][XV[\\[Wlblbfa^`f^ceea`oq\\bhhb[hm\\eZfmfklheke`Zdk]abZ]_i_adYddf]]ZbVXUXU_``^bUYU]_TT\\_Zfgg^^[acaba^NQ^npjrlrtghdig`fdYb^`UVc]`]b\\a]]R]efmbb`cahbWc]^\\V[]a\\]e^R[X\\GS?F?Cjf`Qee^a\\\\eeWZWY^bLSMSMTEMDJDL<D]YdbabZYN`TVPTKNWdbd]Y_^_b]_`aO\\ZelxjqjnfakhZc_]]Z^[ZWVYNSDVDMFIJKZVgiZ`XTOX[UNPecmicc\\kabj_i`]`\\acbd__egcX_Z[_^YZac\\`W]WZe__XYYTcWbd`ab_VZZVSQZKVaYh^d^`SS[YUMOQVicgbfnuynf`g^ig\\bcgeUQKQ\\Z_`V[UR`[ifjpY[]`chd_r]livmbdc_gifojgobqn~t|~{vzzqqx|hhhlkkiggieh_cbVY^ag`aw{g\\d\\`fch\\XZViornki\\e_cgda_[ausxnqmynmmheb`b^eefcfa_Zd^YVSTSR_Rbfc`Z`Yg]Tcgceknejcpijognoks__hdjfcgkifjkpb`X_^bgaaakff]^`achk^gb\\khc]]_X`X`YcY^cc`bfa^``ab_]]OZrosiqmhhojafha[Yabneb\\[U[[\\Qa\\[Weffmhbk__`gfh`eebdcgaeddZ\\XfRLNOidigd]\\ZWWdebb`\\bac`Z[^]VXY`Z]bWcdvtjko_bZngdhw`chpjdcfic_ef`ce^ihmkurqvnrdcefcpbhfca^][Ya[_[N_VKSXTdf`ec_`fo``ccdkmiim_jhlhlighh]tkde_jlega^[cXb[a]e\\b]\\]fagb_bX]Ubfchfkckbaeb_``_^b`^^Z^T\\acaaUT]\\gprkkjfiabccfiba]_dfZeX^a`\\``__bhhsm]iehicigig`l`f\\b]]cb`XXWWURSegb_afjfa^ebge^`ccXb\\_]b[W[\\\\W[^^^cg^dVZZVSUSTZZcfkhlkXYgd[Ya]UO_lnimllyicmbb]g[W]X^T\\[TQVKUNKNGKFIVd^_\\[WZVXXS\\VYkcabhfabdbd\\SZZ^iogneia_XYYbYZMZZ]^_eX[U^^_Y^[TTR_[cdd^_X\\[``TUX`d_gXR\\]]bcbUVMRkfompppdgjme_c`deddeYd_`\\Z]`_\\VZP[liZaWfZRdf`a__\\^jcZ_\\TTYZ_EIBADFcb\\[iaceZY_^_[Q\\^]TUBJDJOJ<@JHJCZUTWJXIWIU<J?C<C\\VZ_[^\\\\VXQP`]JSlilmvk`kgtWYa\\bY\\]UXOOEF8<772608AHYZ[]YWLWUQW\\ULcahnUXdfgiffcb_[][`b^\\]`]Z\\_cRO]R\\ba[eYUX[]_^```V]aabhbbVVQcQUUWPRggmj``fbf`ccGL@@pbgnojhmjehkac_`qiieeheegjbe]`]]`_hb]e`mc]hfg^\\apekmdWmi]hurejagqnq|z~zsqi~oouquljipai^bfa`eZ^Z_b\\qzjojfrjnodcicieif[__^T\\ONVTRVJLy{xqhmkstshi_^`Y_hW[ZWWVSUU[ZRHLBOSNRHAMGRDNHMHOQNQRPYNMNKOJMNGDQTaUdhcakc\\^Z[^f]c[ZhZbX___bVZPbbgdqddcg_gchee]U[`de`]aaWW^_ac^dectxsrnupjqloqkmgcaagZdY\\fb^W[aX_bicmlijjsfajkceZ`d^YSWU[YX]RWN\\ONeldgjegk^fdgggc]d_`^U[RWSXSVUV[Yr`lhglkkhleen^a[mtce\\c[X[\\TQVS\\Vjcxpx~trpmolkjdgieea`b_[XZQUOTQVSKNJUNMaEQGRJLFPGRPOTWQRJTTHHGKMJBOXWab]ZcaWTS]XTZENPIKMFOHWCYKNLPX\\cb_d_fW\\ddbbWX^V_b^SY^HRTVOPFEiknzs{mrlnnwgi_babijefeff`dkef`Uceketmdqkgkegkab`c^bVS[[XU]ZSSSYZXagieei`c`bd_[aW\\Y]X`O_PRS[NNTKOT^[ljihih_cbi`eYd_e\\cY_U[XTGHSTWPxo~vtvupokokrjlg\\e^Zbe\\]WYURTUORJCIQSYUMRTSMJHQAONNSSMMHLMLIHIBRBFXK[\\bZbUUW]SWUZSPORJQMUTNHIWFPHUkenmhghg_fdf\\f]Rg`adelUaY\\b]^eLTvh~vluwineofii_a`l^\\W\\T[^[fc\\Y]R_]jcgibibidcdaNRQU?OFREFNODK?G:@USigaZ]mad^f\\aHUPSR]FM>H?B=A7>:>3:c^d^_c_cX[QYQKCFHNCG?ADD?@A???ADkq|vpylpdhsgc]VXRPJQKGCA@>;D<96989:C<J5=4=491004>BFC@B<@=:467853A<BDDEAF9@7B8>597HPQ?@@?BA8?39035=ekbabgSXQWXZHLFEjfYdZeZSVVWXJKGMmeq|sic}cbfcZ^W[_\\bc[`eeUW_ZZSRKplgb]g]\\iaifYbLRSOnn^_OPRMVQHTSItu~z~x~tmirtn~ghoelf_Q_aa]QKRLJQbnvaikiea`^_gl`[R\\YaUfYUIQHFLI>BLPlr~~wkqumeaolcbbZ\\W[_b\\TUKYOMEKAKOQURRHOOTPLOOOOSVU[\\RVXRSMTTMFG\\RYXZ_X`ZZ_TZZPQeVZSQRUXZPTQNHUJ^egeicjeVbbc]aOPVScaWRVZSKXWV^GK[Ytdxtgghffgef^`O_UbY^PZRUYYQWPQ\\Xjmpfkifb\\dbc_i]^W`FHFGMLJHEM<>;<ede_]acfZVaa^YPPUULWFI@G;B@AAASEcmhjpghibfknZeXb^cVYU[SZKPNIKIGGiezuhvgw}rjhdke^dan^hW`WUWS[OSRVUVLRXMObIVNVWSQKHJPWWYRVRPNOLNPMIHa\\am\\d][XUR`XP[P^P\\QUYZQX^PUPMLGedicedfgW`d`ddRMfcfdZaR_QJX[QZJJmkmkqpmepcukddXWfddjcbabRT]Z\\_QViguwpfhce]`dbc_X`]QRRELJBILJCD8IDGklib_gcc\\V`X[YMPVYRLDFAI=C=@=@HJefkcdctj[ZioWaS_]b^_LRRLFK::>>;7omwpqxswvmqmqcegbgcd[WXS[TPYRVXLOVKONRTQPKQZGMLIHHXPTRZLQROJJLHPJCaWhW[a[XhYO_\\VZWWQgRVVVXJTYXQTTO[_knefeceYe]\\XRUhd__^_Y`ZVaf[S[Zvlpr|tojlkfie^\\[_`d_Vcd\\bYea_X[YahljlhifaadmgdZ\\XUGQUIMND?JJ@C::bhbe^]]f^d[^`bNIPPMY:C=IG;<=:@;?;>kcffgf]`fd\\TSVRNWQLDMLUMKJEGFLBCngwimoaiejc^[[TMTQWSIKG<<IF<9;<8QTOPDDCB?D2=.8.5aeb[\\OWVSPOXQDJHFQEMKL=E9C8>9;18J@SR:D97:=265;12BDkh]^[cTSPW_[FANGdhQSXfNNUYU[QOTJkemmkm___m\\`\\\\`SgeceaiXWU__a\\WUOikih^haa]\\e`]]LVdie^Q^\\RQdJOV]KMsok}kkfhe]\\OMNALMMINDCBA:C@;8A898;336;16/0/1/4,-,-,/,/,+,,*+(),-*,--(+\'+()(*%&\')\'\'\'((*&\'\'(%%&\'&&%&%&$%%%&&%&%$%%%&&&$$%%%%&&&&$$$$%%$%#$#$##$%$$$$$$################\"\"####\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"!!\"\"\"\"\"\"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    }

    function explode(x, y) {
        loadMusic();
        volumeData = new VolumeData(string);
        audio.play();

        var interval = setInterval(function() {myTimer()}, 666);

        function myTimer(){
            var t = audio.currentTime;
            var vol = volumeData.getVolume(t);

            var avgVol = volumeData.getAverageVolume(t-0.666,t);

            var total = avgVol.left+avgVol.right;

	    var origin_left = posRand(0, $(window).width());
	    var origin_top = posRand(0, $(window).height());

            for (var i = 0; i < 30; i++) {
                var $div = $('<div id="frag1" class="fragment"></div>');
                $('body').append($div);

                $div.css({
		    left: origin_left,
		    top: origin_top,
		    width: 20,
		    height: 20
                });

                var time = ((new Date()).getTime() * 50) % 16777215;
		if(time < 3355443) {
		    time = 3355443;
		}
                var color = '#' + time.toString(16);
                $div.css('background', color);
        
                $div.animate({
                    width: '-=10',
                    height: '-=10',
                    left: '+=' + Math.min(rand()*total*total, ($(window).width())/2),
                    top: '+=' + Math.min(rand()*total*total, ($(window).height())/2),
                    opacity: '-=1'
                }, 'slow', function() {
                    $(this).remove();
                });


            }
        }
        

    }

    return explode;
});

(function(window) {

/**
 * Constructs a VolumeData object with the specified data.
 * @class Provides an easy interface for reading volume data generated by the VolumeData application.
 * @param data The volume data that was output by the VolumeData application. This can either be an Image or a string.
 * @param sampleRate The sample rate that the volume data was generated at. Defaults to 50hz.
 **/
function VolumeData(data, sampleRate) {
  this.initialize(data, sampleRate);
}
var p = VolumeData.prototype;

VolumeData.HEADER_SIZE = 2;


/** @private **/
VolumeData._workingCanvas = document.createElement("canvas");

// public properties:
    /** READ-ONLY. The sample rate of the data in hertz. **/
    p.sampleRate = 0;
    /** READ-ONLY. Indicates whether the sample data is in stereo. **/
    p.stereo = true;
    /** READ-ONLY. Indicates total number of samples in the data. **/
    p.numSamples = 0;
    /** Value to multiply against the volume values. For example, for a particularly quiet track, you could set gain=2 to increase the range. **/
    p.gain = 1;
    
// private properties:
    /** @private **/
    p._data = null;
    /** @private **/
    p._headerSize = 0;
    /** @private **/
    p._color1 = -1;
    /** @private **/
    p._color2 = -1;
    
// constructor:
    /** @private **/
    p.initialize = function(data, sampleRate) {
        this.sampleRate = sampleRate ? sampleRate : 50;
        if (typeof(data) == "string") {
            this._getVolume = this._getVolumeString;
            this.data = data;
            this._headerSize = 1;
            this.stereo = data.charAt(0) != "0";
            this.numSamples = data.length-this._headerSize;
        } else if (data instanceof Image) {
            this._getVolume = this._getVolumeImage;
            var canvas = VolumeData._workingCanvas;
            canvas.width = data.width;
            canvas.height = data.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(data, 0, 0);
            this.data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            
            this._getColors(0);
            if (this.color1 == -1) { throw("Unable to parse color markers."); }
            this.stereo = (this.color2 != -1);
            this._headerSize = 2;
            this.numSamples = this.data.length/4-this._headerSize;
        } else {
            throw("Unrecognized data type for VolumeData. Must be Image or String.")
        }
    }
    
// public methods:
    /**
     * Returns the sample index for the specified time.
     * @param time The time in seconds.
     **/
    p.getIndex = function(time) {
        return Math.max(0,Math.min(this.numSamples,time*this.sampleRate));
    }
    
    /**
     * Returns an object with left and right properties corresponding to the volume at the specified time.
     * If the volume data is monoaural, then both left and right properties will have the same value.
     * @param time The time in seconds.
     * @param o Optional. An object to append the left and right properties to. If this is undefined a new generic object will be returned.
     **/
    p.getVolume = function(time, o) {
        if (!o) { o = {}; }
        var index = Math.round(this.getIndex(time));
        if (index < 0 || index > this.numSamples) {
            o.left = o.right = 0;
        } else {
            this._getVolume(index,o);
        }
        return o;
    }
    
    /**
     * Returns an object with left and right properties corresponding to the average volume over the
     * specified time range.
     * If the volume data is monoaural, then both left and right properties will have the same value.
     * @param start The start time in seconds.
     * @param end The end time in seconds.
     * @param o Optional. An object to append the left and right properties to. If this is undefined a new generic object will be returned.
     **/
    p.getAverageVolume = function(start, end, o) {
        if (!o) { o = {}; }
        start = Math.round(this.getIndex(start));
        end = Math.round(this.getIndex(end));
        if (end < start) {
            o.left = o.right = 0;
        } else {
            var l = 0;
            var r = 0;
            for (var i=start; i<=end; i++) {
                this._getVolume(i,o);
                l += o.left;
                r += o.right;
            }
            o.left = l/(end-start+1);
            o.right = r/(end-start+1);
        }
        return o;
    }
    
    /**
    * Returns a string representation of this object.
    **/
    p.toString = function() {
        return "[VolumeData]";
    }
    
// private methods:

    // separated so it can be used more easily in subclasses:
    /** @private **/
    p._getVolume = null;

    /** @private **/
    p._getVolumeImage = function(sampleIndex,o) {
        sampleIndex += this._headerSize;
        if (this.stereo) {
            o.left = Math.min(1, this.data[sampleIndex*4+this.color1]/0xFF *this.gain);
            o.right = Math.min(1, this.data[sampleIndex*4+this.color2]/0xFF *this.gain);
        } else {
            o.left = o.right = Math.min(1, this.data[sampleIndex*4+this.color1]/0xFF *this.gain);
        }
    }

    /** @private **/
    p._getVolumeString = function(sampleIndex,o) {
        if (this.stereo) {
            o.left = Math.min(1, (this.data.charCodeAt(sampleIndex*2+this._headerSize|0)-33)/93 *this.gain);
            o.right = Math.min(1, (this.data.charCodeAt(sampleIndex*2+this._headerSize+1|0)-33)/93 *this.gain);
        } else {
            o.left = o.right = Math.min(1, (this.data.charCodeAt(sampleIndex+this._headerSize|0)-33)/93 *this.gain);
        }
    }

    /** @private **/
    p._getColors = function(index) {
        var r = this.data[index*4];
        var g = this.data[index*4+1];

        var b = this.data[index*4+2];
        this.color1 = this.color2 = -1;
        if (r > 0x40) {
            this.color1 = 0;
            if (g > 0x40) { this.color2 = 1; }
            else if (b > 0x40) { this.color2 = 2; }
        } else if (g > 0x40) {
            this.color1 = 1;
            if (b > 0x40) { this.color2 = 2; }
        } else if (b > 0x40) {
            this.color1 = 2;
        }
    }

    /** @private **/
    p._getSampleRate = function(index) {
        // doesn't seem to work well enough with JPEG compression
        var g = this.data[index*4+1];
        var b = this.data[index*4+2];
        this.sampleRate = Math.round(g/15)*16+Math.round(b/15);
    }

window.VolumeData = VolumeData;
}(window));