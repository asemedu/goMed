-- Script to clear existing questions and seed 50 Romanian questions across 11 categories


WITH q1 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Conform Legii 95/2006, cine poate acorda primul ajutor de bază?', 'siguranta', 10, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q1), 'Doar medicii și asistenții medicali.', false, 0),
  ((SELECT id FROM q1), 'Orice persoană, chiar și fără instruire, dacă urmează indicațiile dispecerului 112.', true, 1),
  ((SELECT id FROM q1), 'Doar polițiștii și pompierii.', false, 2),
  ((SELECT id FROM q1), 'Doar persoanele cu vârsta peste 18 ani.', false, 3);

WITH q2 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este primul și cel mai important pas înainte de a acorda primul ajutor?', 'siguranta', 10, 15) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q2), 'Verificarea respirației victimei.', false, 0),
  ((SELECT id FROM q2), 'Apelarea numărului de urgență 112.', false, 1),
  ((SELECT id FROM q2), 'Asigurarea siguranței salvatorului și a zonei.', true, 2),
  ((SELECT id FROM q2), 'Începerea masajului cardiac.', false, 3);

WITH q3 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Ce faci dacă ești martor la un înec, dar nu știi să înoți?', 'siguranta', 10, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q3), 'Sari în apă pentru că viața victimei este mai importantă.', false, 0),
  ((SELECT id FROM q3), 'Cauți un obiect lung (baston, frânghie) și suni la 112, fără să te pui în pericol.', true, 1),
  ((SELECT id FROM q3), 'Pleci să cauți un medic.', false, 2),
  ((SELECT id FROM q3), 'Aștepți pe mal până victima iese singură.', false, 3);

WITH q4 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este ordinea corectă a primilor 3 pași din "Lanțul Supraviețuirii"?', 'siguranta', 20, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q4), 'Apel 112 -> RCP -> Defibrilare', false, 0),
  ((SELECT id FROM q4), 'Siguranța salvatorului -> Recunoașterea urgenței -> Apel 112', true, 1),
  ((SELECT id FROM q4), 'Recunoașterea urgenței -> RCP -> Apel 112', false, 2),
  ((SELECT id FROM q4), 'Siguranța salvatorului -> Defibrilare -> RCP', false, 3);

WITH q5 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Când te poți opri din efectuarea manevrelor de resuscitare (RCP)?', 'siguranta', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q5), 'După 5 minute de manevre.', false, 0),
  ((SELECT id FROM q5), 'Când victima dă semne de viață, sosește echipajul medical sau ești complet epuizat.', true, 1),
  ((SELECT id FROM q5), 'Când se adună prea mulți oameni în jur.', false, 2),
  ((SELECT id FROM q5), 'Dacă victima nu își revine după 3 serii de compresii.', false, 3);

WITH q6 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este atitudinea corectă atunci când suni la 112?', 'evaluare_112', 10, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q6), 'Dai repede adresa și închizi telefonul ca să faci resuscitare.', false, 0),
  ((SELECT id FROM q6), 'Răspunzi la întrebări, oferi locația exactă și nu închizi până nu ți se spune.', true, 1),
  ((SELECT id FROM q6), 'Urli la dispecer să trimită o ambulanță mai repede.', false, 2),
  ((SELECT id FROM q6), 'Suni doar după ce ai terminat de acordat primul ajutor.', false, 3);

WITH q7 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Ce înseamnă acronimul "PAS" în evaluarea respirației?', 'evaluare_112', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q7), 'Privește, Ascultă, Simte', true, 0),
  ((SELECT id FROM q7), 'Presiune, Aer, Sânge', false, 1),
  ((SELECT id FROM q7), 'Picioare, Abdomen, Spate', false, 2),
  ((SELECT id FROM q7), 'Prinde, Apasă, Salvează', false, 3);

WITH q8 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este timpul MAXIM în care trebuie să verifici dacă o victimă respiră (Privește, Ascultă, Simte)?', 'evaluare_112', 20, 15) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q8), '5 secunde', false, 0),
  ((SELECT id FROM q8), '10 secunde', true, 1),
  ((SELECT id FROM q8), '30 de secunde', false, 2),
  ((SELECT id FROM q8), '1 minut', false, 3);

WITH q9 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Litera "A" din protocolul ABC vine de la "Airway". Cum eliberezi corect căile aeriene la o victimă FĂRĂ traumatism de coloană?', 'evaluare_112', 20, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q9), 'Tragi de limba victimei cu mâna.', false, 0),
  ((SELECT id FROM q9), 'Îi pui o pernă mare sub cap.', false, 1),
  ((SELECT id FROM q9), 'Pui o mână pe frunte și faci hiperextensia capului, ridicând bărbia cu două degete.', true, 2),
  ((SELECT id FROM q9), 'O întorci brusc pe burtă.', false, 3);

WITH q10 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Unde se poziționează corect mâinile pentru compresiile toracice la adult?', 'rcp_adulti', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q10), 'Pe partea stângă a pieptului, deasupra inimii.', false, 0),
  ((SELECT id FROM q10), 'Pe stomac.', false, 1),
  ((SELECT id FROM q10), 'Pe mijlocul sternului (osul pieptului).', true, 2),
  ((SELECT id FROM q10), 'Pe coastele din partea dreaptă.', false, 3);

WITH q11 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este unghiul corect al brațelor salvatorului față de pieptul victimei în timpul compresiilor toracice?', 'rcp_adulti', 30, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q11), '45 de grade, cu coatele ușor îndoite.', false, 0),
  ((SELECT id FROM q11), '90 de grade (perpendiculare), cu coatele ferm drepte (întinse).', true, 1),
  ((SELECT id FROM q11), '60 de grade, apăsând din umeri.', false, 2),
  ((SELECT id FROM q11), 'Nu contează unghiul, contează doar forța.', false, 3);

WITH q12 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este adâncimea și frecvența corectă a compresiilor toracice la un adult?', 'rcp_adulti', 30, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q12), '2-3 cm adâncime, 60-80 compresii pe minut.', false, 0),
  ((SELECT id FROM q12), '5-6 cm adâncime, 100-120 compresii pe minut.', true, 1),
  ((SELECT id FROM q12), '7-8 cm adâncime, 140 compresii pe minut.', false, 2),
  ((SELECT id FROM q12), '10 cm adâncime, 100 compresii pe minut.', false, 3);

WITH q13 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este raportul corect între compresiile toracice și ventilații (respirații gură la gură) la adult?', 'rcp_adulti', 10, 15) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q13), '15 compresii : 2 ventilații', false, 0),
  ((SELECT id FROM q13), '30 compresii : 2 ventilații', true, 1),
  ((SELECT id FROM q13), '5 compresii : 1 ventilație', false, 2),
  ((SELECT id FROM q13), '50 compresii : 5 ventilații', false, 3);

WITH q14 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('De unde trebuie să provină forța atunci când execuți compresiile toracice?', 'rcp_adulti', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q14), 'Din mușchii brațelor.', false, 0),
  ((SELECT id FROM q14), 'Din încheieturile mâinilor.', false, 1),
  ((SELECT id FROM q14), 'Din greutatea propriului corp, nu doar din brațe.', true, 2),
  ((SELECT id FROM q14), 'Din mușchii spatelui.', false, 3);

WITH q15 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Când este cel mai eficient să folosești un defibrilator (AED) pentru a crește șansele de supraviețuire?', 'aed', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q15), 'După 15 minute de la stopul cardiac.', false, 0),
  ((SELECT id FROM q15), 'În primele 3-5 minute.', true, 1),
  ((SELECT id FROM q15), 'Doar după ce sosește ambulanța.', false, 2),
  ((SELECT id FROM q15), 'După ce victima se trezește.', false, 3);

WITH q16 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Ce trebuie să faci când aparatul AED dă comanda "NU ATINGEȚI PACIENTUL"?', 'aed', 10, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q16), 'Continui masajul cardiac mai încet.', false, 0),
  ((SELECT id FROM q16), 'Te asiguri că nimeni nu atinge victima, deoarece aparatul analizează ritmul cardiac sau administrează șocul.', true, 1),
  ((SELECT id FROM q16), 'Îi verifici pulsul.', false, 2),
  ((SELECT id FROM q16), 'Muți electrozii.', false, 3);

WITH q17 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Ce faci cu electrozii defibrilatorului dacă victima începe să respire sau pe parcursul resuscitării?', 'aed', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q17), 'Îi dezlipești și oprești aparatul.', false, 0),
  ((SELECT id FROM q17), 'Îi muți pe spate.', false, 1),
  ((SELECT id FROM q17), 'Îi lași lipiți pe piept, deoarece aparatul te va ajuta în continuare.', true, 2),
  ((SELECT id FROM q17), 'Îi speli cu apă și îi pui la loc.', false, 3);

WITH q18 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cine decide dacă victima are nevoie de șoc electric?', 'aed', 10, 15) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q18), 'Salvatorul care acordă primul ajutor.', false, 0),
  ((SELECT id FROM q18), 'Martorii din jur.', false, 1),
  ((SELECT id FROM q18), 'Defibrilatorul (AED) în urma analizei ritmului cardiac.', true, 2),
  ((SELECT id FROM q18), 'Medicul, prin telefon.', false, 3);

WITH q19 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Când se folosește Poziția Laterală de Siguranță (PLS)?', 'pls', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q19), 'Când victima este inconștientă și NU respiră.', false, 0),
  ((SELECT id FROM q19), 'Când victima este conștientă, dar o doare burta.', false, 1),
  ((SELECT id FROM q19), 'Când victima este inconștientă, DAR respiră normal și are puls.', true, 2),
  ((SELECT id FROM q19), 'În caz de hemoragie arterială la o mână.', false, 3);

WITH q20 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este principalul scop al Poziției Laterale de Siguranță?', 'pls', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q20), 'Să încălzească victima.', false, 0),
  ((SELECT id FROM q20), 'Să prevină blocarea căilor respiratorii cu propria limbă, secreții sau vărsături.', true, 1),
  ((SELECT id FROM q20), 'Să oprească o sângerare.', false, 2),
  ((SELECT id FROM q20), 'Să reducă durerea de spate.', false, 3);

WITH q21 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cum trebuie poziționat capul victimei aflată în PLS?', 'pls', 30, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q21), 'Cât mai aplecat în față (bărbia în piept).', false, 0),
  ((SELECT id FROM q21), 'Ușor înclinat pe spate (hiperextensie) cu gura orientată în jos pentru scurgerea fluidelor.', true, 1),
  ((SELECT id FROM q21), 'Drept, perfect aliniat cu coloana.', false, 2),
  ((SELECT id FROM q21), 'Sprijinit pe o pernă înaltă.', false, 3);

WITH q22 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Dacă ambulanța întârzie, după cât timp trebuie să întorci victima aflată în PLS pe cealaltă parte?', 'pls', 30, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q22), 'După 5 minute.', false, 0),
  ((SELECT id FROM q22), 'După 15 minute.', false, 1),
  ((SELECT id FROM q22), 'După 30 de minute, pentru a evita compresia îndelungată pe un singur braț.', true, 2),
  ((SELECT id FROM q22), 'Nu trebuie întoarsă niciodată.', false, 3);

WITH q23 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cum reacționezi dacă o persoană se îneacă cu mâncare, dar poate vorbi și tuși puternic (obstrucție parțială)?', 'dezobstructie', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q23), 'O bați puternic pe spate imediat.', false, 0),
  ((SELECT id FROM q23), 'Îi aplici manevra Heimlich.', false, 1),
  ((SELECT id FROM q23), 'O încurajezi să tușească și o supraveghezi, fără să intervii forțat.', true, 2),
  ((SELECT id FROM q23), 'Îi dai să bea multă apă.', false, 3);

WITH q24 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cum se aplică corect Manevra Heimlich la un adult conștient?', 'dezobstructie', 30, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q24), 'Pumnul pe stern, apeși în jos.', false, 0),
  ((SELECT id FROM q24), 'Pumnul între ombilic și stern, cealaltă mână deasupra, tragi brusc spre tine și în sus.', true, 1),
  ((SELECT id FROM q24), 'Palmele pe coaste, apeși lateral.', false, 2),
  ((SELECT id FROM q24), 'Bați cu pumnul în spatele capului.', false, 3);

WITH q25 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Câte lovituri interscapulare (între omoplați) se aplică inițial unei persoane cu obstrucție completă?', 'dezobstructie', 10, 15) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q25), '2 lovituri', false, 0),
  ((SELECT id FROM q25), '3 lovituri', false, 1),
  ((SELECT id FROM q25), '5 lovituri', true, 2),
  ((SELECT id FROM q25), '10 lovituri', false, 3);

WITH q26 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cum se modifică manevra Heimlich pentru persoanele obeze sau femeile gravide?', 'dezobstructie', 30, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q26), 'Se face exact la fel.', false, 0),
  ((SELECT id FROM q26), 'Se aplică doar lovituri pe spate, niciodată compresii.', false, 1),
  ((SELECT id FROM q26), 'Compresiile nu se fac pe abdomen, ci la nivelul părții inferioare a sternului (pe piept).', true, 2),
  ((SELECT id FROM q26), 'Se așează persoana pe jos și se apasă pe burtă.', false, 3);

WITH q27 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Ce faci imediat dacă persoana care s-a înecat cu un corp străin devine inconștientă?', 'dezobstructie', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q27), 'O pui în Poziția Laterală de Siguranță.', false, 0),
  ((SELECT id FROM q27), 'Continui manevra Heimlich pe podea.', false, 1),
  ((SELECT id FROM q27), 'O așezi pe spate, suni la 112 și începi resuscitarea cardio-pulmonară (compresii toracice).', true, 2),
  ((SELECT id FROM q27), 'Încerci să îi bagi degetele în gât orbește.', false, 3);

WITH q28 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este primul pas diferit în resuscitarea unui copil față de un adult, dacă acesta nu respiră?', 'copii_sugari', 30, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q28), 'Se aplică direct șocul electric.', false, 0),
  ((SELECT id FROM q28), 'Se oferă inițial 5 respirații salvatoare, înainte de compresiile toracice.', true, 1),
  ((SELECT id FROM q28), 'Se fac 15 compresii toracice.', false, 2),
  ((SELECT id FROM q28), 'Se sună la 112 abia după 10 minute.', false, 3);

WITH q29 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cum se efectuează compresiile toracice la un bebeluș (sub 1 an)?', 'copii_sugari', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q29), 'Cu ambele mâini.', false, 0),
  ((SELECT id FROM q29), 'Cu podul unei singure palme.', false, 1),
  ((SELECT id FROM q29), 'Cu 2 degete pe mijlocul pieptului.', true, 2),
  ((SELECT id FROM q29), 'Cu degetele mari, strângând cutia toracică.', false, 3);

WITH q30 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cum aplici primul ajutor unui bebeluș care s-a înecat cu o jucărie mică (obstrucție totală)?', 'copii_sugari', 30, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q30), 'Îi faci manevra Heimlich de abdomen, ca la adult.', false, 0),
  ((SELECT id FROM q30), 'Îl ții de picioare cu capul în jos și îl scuturi.', false, 1),
  ((SELECT id FROM q30), 'Aplici 5 lovituri între omoplați, urmate de 5 apăsări pe piept (cu 2 degete).', true, 2),
  ((SELECT id FROM q30), 'Îi dai să bea lapte fierbinte.', false, 3);

WITH q31 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('La ce adâncime se fac compresiile toracice la copii?', 'copii_sugari', 30, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q31), '1-2 cm.', false, 0),
  ((SELECT id FROM q31), '5-6 cm, exact ca la adult.', false, 1),
  ((SELECT id FROM q31), 'Aproximativ o treime din grosimea pieptului (aprox. 4 cm bebeluș, 5 cm copil).', true, 2),
  ((SELECT id FROM q31), 'Până auzi un "poc".', false, 3);

WITH q32 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care acțiune este strict INTERZISĂ când cineva are o criză de epilepsie (convulsii)?', 'urgente_medicale', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q32), 'Îndepărtarea obiectelor din jur cu care s-ar putea răni.', false, 0),
  ((SELECT id FROM q32), 'Să-i bagi forțat un obiect în gură pentru a nu-și înghiți limba sau a-l imobiliza cu forța.', true, 1),
  ((SELECT id FROM q32), 'Așezarea unui material moale sub cap.', false, 2),
  ((SELECT id FROM q32), 'Cronometrarea duratei crizei.', false, 3);

WITH q33 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Ce trebuie să faci dacă o persoană leșină (își pierde cunoștința pentru scurt timp)?', 'urgente_medicale', 10, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q33), 'O stropești imediat cu apă rece pe față.', false, 0),
  ((SELECT id FROM q33), 'O așezi pe spate și îi ridici puțin picioarele pentru a ajuta circulația sângelui spre creier.', true, 1),
  ((SELECT id FROM q33), 'O pui în șezut și îi dai palme.', false, 2),
  ((SELECT id FROM q33), 'Îi dai să bea apă cu zahăr imediat, deși e inconștientă.', false, 3);

WITH q34 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care dintre următoarele NU este un declanșator frecvent al șocului anafilactic?', 'urgente_medicale', 10, 15) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q34), 'Alunele.', false, 0),
  ((SELECT id FROM q34), 'Înțepăturile de albine.', false, 1),
  ((SELECT id FROM q34), 'Apa plată.', true, 2),
  ((SELECT id FROM q34), 'Penicilina.', false, 3);

WITH q35 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este tratamentul de urgență pe care îl poți administra (dacă există) în caz de anafilaxie?', 'urgente_medicale', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q35), 'O pastilă de paracetamol.', false, 0),
  ((SELECT id FROM q35), 'Auto-injectorul cu adrenalină (EpiPen), administrat în coapsă.', true, 1),
  ((SELECT id FROM q35), 'O sticlă cu apă rece.', false, 2),
  ((SELECT id FROM q35), 'Un inhalator pentru astm.', false, 3);

WITH q36 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Ce trebuie să faci imediat DUPĂ ce o criză de epilepsie s-a încheiat, iar pacientul este încă inconștient, dar respiră?', 'urgente_medicale', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q36), 'Îl întorci în Poziția Laterală de Siguranță (PLS).', true, 0),
  ((SELECT id FROM q36), 'Îi faci masaj cardiac.', false, 1),
  ((SELECT id FROM q36), 'Îl ajuți să se ridice în picioare.', false, 2),
  ((SELECT id FROM q36), 'Îl lași pe spate cu picioarele ridicate.', false, 3);

WITH q37 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cum asiguri căile aeriene la o victimă pe care o suspectezi de traumatism la coloana cervicală (ex: accident rutier)?', 'trauma', 30, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q37), 'Faci hiperextensia puternică a capului.', false, 0),
  ((SELECT id FROM q37), 'Răsucești gâtul spre stânga.', false, 1),
  ((SELECT id FROM q37), 'Folosești subluxația mandibulei (ridici bărbia fără să miști gâtul).', true, 2),
  ((SELECT id FROM q37), 'Nu te atingi de căile aeriene.', false, 3);

WITH q38 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cum recunoști o hemoragie arterială (cea mai periculoasă)?', 'trauma', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q38), 'Sângele se scurge lent și este închis la culoare.', false, 0),
  ((SELECT id FROM q38), 'Sângele este roșu aprins și țâșnește pulsatil (în ritmul inimii).', true, 1),
  ((SELECT id FROM q38), 'Sângele este amestecat cu puroi.', false, 2),
  ((SELECT id FROM q38), 'Sângele este doar la suprafața zgârieturii.', false, 3);

WITH q39 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este primul pas în acordarea primului ajutor pentru o hemoragie externă abundentă?', 'trauma', 20, 15) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q39), 'Spălarea rănii cu apă oxigenată.', false, 0),
  ((SELECT id FROM q39), 'Aplicarea unui garou direct pe gât.', false, 1),
  ((SELECT id FROM q39), 'Aplicarea de presiune directă pe rană cu o compresă și ridicarea membrului afectat.', true, 2),
  ((SELECT id FROM q39), 'Așteptarea coagulării naturale.', false, 3);

WITH q40 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este regula de aur dacă găsești o victimă a unei căderi de la înălțime care este conștientă?', 'trauma', 10, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q40), 'O pui rapid în Poziția Laterală de Siguranță.', false, 0),
  ((SELECT id FROM q40), 'O ajuți să se ridice și să meargă.', false, 1),
  ((SELECT id FROM q40), 'NU o miști absolut deloc până nu vin salvatorii, decât dacă viața ei este în pericol iminent (foc, explozie).', true, 2),
  ((SELECT id FROM q40), 'O urci în mașina ta și mergi la spital.', false, 3);

WITH q41 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('În cazul unei arsuri termice proaspete, ce spune "Regula de 10"?', 'arsuri', 30, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q41), 'Aplică 10 cuburi de gheață timp de 10 secunde.', false, 0),
  ((SELECT id FROM q41), 'Apă de la robinet la aprox. 10 grade, aplicată timp de 10 minute, de la o distanță de 10 cm.', true, 1),
  ((SELECT id FROM q41), 'Aplică o cremă de 10 ori pe parcursul a 10 ore.', false, 2),
  ((SELECT id FROM q41), 'Bea 10 pahare cu apă.', false, 3);

WITH q42 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Ce ACȚIUNE ESTE INTERZISĂ atunci când acorzi primul ajutor pentru o arsură?', 'arsuri', 10, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q42), 'Răcirea cu apă.', false, 0),
  ((SELECT id FROM q42), 'Îndepărtarea inelelor sau ceasurilor înainte de umflarea pielii.', false, 1),
  ((SELECT id FROM q42), 'Spargerea veziculelor (bășicilor) cu lichid și aplicarea de ulei, iaurt sau făină.', true, 2),
  ((SELECT id FROM q42), 'Acoperirea cu un pansament curat și uscat.', false, 3);

WITH q43 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cât timp trebuie spălat cu un jet continuu de apă rece un ochi afectat de o arsură chimică?', 'arsuri', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q43), '1 minut.', false, 0),
  ((SELECT id FROM q43), '3 minute.', false, 1),
  ((SELECT id FROM q43), 'Cel puțin 10-20 de minute.', true, 2),
  ((SELECT id FROM q43), 'Nu se spală cu apă, ci se șterge cu un prosop.', false, 3);

WITH q44 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Care este PRIMUL lucru pe care trebuie să-l faci când găsești o persoană electrocutată care încă atinge sursa?', 'arsuri', 10, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q44), 'Tragi victima de mâini cât mai repede.', false, 0),
  ((SELECT id FROM q44), 'Torni apă peste ea pentru a stinge posibilele arsuri.', false, 1),
  ((SELECT id FROM q44), 'Întrerupi sursa de energie electrică (scoți ștecherul, oprești siguranța) înainte de a o atinge.', true, 2),
  ((SELECT id FROM q44), 'Îi faci manevra Heimlich.', false, 3);

WITH q45 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('De ce sunt arsurile electrice considerate extrem de periculoase, chiar dacă rana exterioară pare mică?', 'arsuri', 30, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q45), 'Pentru că provoacă alergii grave.', false, 0),
  ((SELECT id FROM q45), 'Pentru că "drumul" curentului prin corp poate distruge mușchi, vase de sânge și poate afecta inima și creierul.', true, 1),
  ((SELECT id FROM q45), 'Pentru că se vindecă cu semne inestetice.', false, 2),
  ((SELECT id FROM q45), 'Pentru că victima se poate îmbolnăvi de gripă.', false, 3);

WITH q46 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cum se realizează corect încălzirea unui pacient cu hipotermie (ex: scos dintr-un râu înghețat)?', 'intoxicatii', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q46), 'Foarte brusc, băgat direct într-o baie cu apă clocotită.', false, 0),
  ((SELECT id FROM q46), 'Treptat, îndepărtând hainele ude și acoperindu-l cu pături uscate, fără a-l freca.', true, 1),
  ((SELECT id FROM q46), 'Oferindu-i imediat mult alcool de băut.', false, 2),
  ((SELECT id FROM q46), 'Frecându-i puternic pielea pentru a genera frecare.', false, 3);

WITH q47 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Ce NU trebuie să faci atunci când scoți din apă o victimă a înecului care nu respiră?', 'intoxicatii', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q47), 'Să suni la 112.', false, 0),
  ((SELECT id FROM q47), 'Să încerci să scurgi apa din plămânii ei presându-i burta.', true, 1),
  ((SELECT id FROM q47), 'Să începi resuscitarea cardio-pulmonară (RCP).', false, 2),
  ((SELECT id FROM q47), 'Să o pui pe o suprafață plană, dură.', false, 3);

WITH q48 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Ce manifestări sugerează o urgență extremă (formă severă) de hipertermie (insolație gravă / heat stroke)?', 'intoxicatii', 30, 30) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q48), 'Piele rece, tremurături, buze vinete.', false, 0),
  ((SELECT id FROM q48), 'Tuse cu sânge.', false, 1),
  ((SELECT id FROM q48), 'Temperatură foarte mare a corpului, confuzie/comă, piele fierbinte, absența transpirației.', true, 2),
  ((SELECT id FROM q48), 'Dureri de stomac și vedere îmbunătățită.', false, 3);

WITH q49 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Cum procedezi în cazul unei intoxicații cu Monoxid de Carbon (gaz incolor, inodor)?', 'intoxicatii', 10, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q49), 'Pui pacientul în Poziția Laterală de Siguranță direct în camera respectivă.', false, 0),
  ((SELECT id FROM q49), 'Scoți victima imediat la aer curat, aerisești încăperea și suni la 112.', true, 1),
  ((SELECT id FROM q49), 'Îi dai să bea lapte.', false, 2),
  ((SELECT id FROM q49), 'Aștepți să vezi dacă îi trece durerea de cap.', false, 3);

WITH q50 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Sub ce valoare trebuie să scadă temperatura corpului pentru a se instala hipotermia?', 'intoxicatii', 20, 15) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q50), 'Sub 37°C', false, 0),
  ((SELECT id FROM q50), 'Sub 36°C', false, 1),
  ((SELECT id FROM q50), 'Sub 35°C', true, 2),
  ((SELECT id FROM q50), 'Sub 30°C', false, 3);
