-- =============================================================================
-- BILINGUAL FIRST-AID QUESTIONS SEED SCRIPT (ROMANIAN + ENGLISH)
-- Contains 50 Romanian questions ('ro') + 50 English questions ('en')
-- Across all 11 medical modules with full answers and correctness flags.
-- =============================================================================

-- 1. Ensure language column exists on questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'ro';

-- 2. Create index for fast category & language filtering
CREATE INDEX IF NOT EXISTS idx_questions_category_language ON questions(category, language);

-- 3. Clear existing question sets to prevent duplicates
DELETE FROM lobby_questions;
DELETE FROM answers;
DELETE FROM questions;

-- =============================================================================
-- 4. SEED 50 ROMANIAN QUESTIONS (language = 'ro')
-- =============================================================================

WITH ro_q1 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Conform Legii 95/2006, cine poate acorda primul ajutor de bază?', 'siguranta', 10, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q1), 'Doar medicii și asistenții medicali.', false, 0),
  ((SELECT id FROM ro_q1), 'Orice persoană, chiar și fără instruire, dacă urmează indicațiile dispecerului 112.', true, 1),
  ((SELECT id FROM ro_q1), 'Doar polițiștii și pompierii.', false, 2),
  ((SELECT id FROM ro_q1), 'Doar persoanele cu vârsta peste 18 ani.', false, 3);

WITH ro_q2 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este primul și cel mai important pas înainte de a acorda primul ajutor?', 'siguranta', 10, 15, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q2), 'Verificarea respirației victimei.', false, 0),
  ((SELECT id FROM ro_q2), 'Apelarea numărului de urgență 112.', false, 1),
  ((SELECT id FROM ro_q2), 'Asigurarea siguranței salvatorului și a zonei.', true, 2),
  ((SELECT id FROM ro_q2), 'Începerea masajului cardiac.', false, 3);

WITH ro_q3 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Ce faci dacă ești martor la un înec, dar nu știi să înoți?', 'siguranta', 10, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q3), 'Sari în apă pentru că viața victimei este mai importantă.', false, 0),
  ((SELECT id FROM ro_q3), 'Cauți un obiect lung (baston, frânghie) și suni la 112, fără să te pui în pericol.', true, 1),
  ((SELECT id FROM ro_q3), 'Pleci să cauți un medic.', false, 2),
  ((SELECT id FROM ro_q3), 'Aștepți pe mal până victima iese singură.', false, 3);

WITH ro_q4 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este ordinea corectă a primilor 3 pași din "Lanțul Supraviețuirii"?', 'siguranta', 20, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q4), 'Apel 112 -> RCP -> Defibrilare', false, 0),
  ((SELECT id FROM ro_q4), 'Siguranța salvatorului -> Recunoașterea urgenței -> Apel 112', true, 1),
  ((SELECT id FROM ro_q4), 'Recunoașterea urgenței -> RCP -> Apel 112', false, 2),
  ((SELECT id FROM ro_q4), 'Siguranța salvatorului -> Defibrilare -> RCP', false, 3);

WITH ro_q5 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Când te poți opri din efectuarea manevrelor de resuscitare (RCP)?', 'siguranta', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q5), 'După 5 minute de manevre.', false, 0),
  ((SELECT id FROM ro_q5), 'Când victima dă semne de viață, sosește echipajul medical sau ești complet epuizat.', true, 1),
  ((SELECT id FROM ro_q5), 'Când se adună prea mulți oameni în jur.', false, 2),
  ((SELECT id FROM ro_q5), 'Dacă victima nu își revine după 3 serii de compresii.', false, 3);

WITH ro_q6 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este atitudinea corectă atunci când suni la 112?', 'evaluare_112', 10, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q6), 'Dai repede adresa și închizi telefonul ca să faci resuscitare.', false, 0),
  ((SELECT id FROM ro_q6), 'Răspunzi la întrebări, oferi locația exactă și nu închizi până nu ți se spune.', true, 1),
  ((SELECT id FROM ro_q6), 'Urli la dispecer să trimită o ambulanță mai repede.', false, 2),
  ((SELECT id FROM ro_q6), 'Suni doar după ce ai terminat de acordat primul ajutor.', false, 3);

WITH ro_q7 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Ce înseamnă acronimul "PAS" în evaluarea respirației?', 'evaluare_112', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q7), 'Privește, Ascultă, Simte', true, 0),
  ((SELECT id FROM ro_q7), 'Presiune, Aer, Sânge', false, 1),
  ((SELECT id FROM ro_q7), 'Picioare, Abdomen, Spate', false, 2),
  ((SELECT id FROM ro_q7), 'Prinde, Apasă, Salvează', false, 3);

WITH ro_q8 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este timpul MAXIM în care trebuie să verifici dacă o victimă respiră (Privește, Ascultă, Simte)?', 'evaluare_112', 20, 15, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q8), '5 secunde', false, 0),
  ((SELECT id FROM ro_q8), '10 secunde', true, 1),
  ((SELECT id FROM ro_q8), '30 de secunde', false, 2),
  ((SELECT id FROM ro_q8), '1 minut', false, 3);

WITH ro_q9 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Litera "A" din protocolul ABC vine de la "Airway". Cum eliberezi corect căile aeriene la o victimă FĂRĂ traumatism de coloană?', 'evaluare_112', 20, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q9), 'Tragi de limba victimei cu mâna.', false, 0),
  ((SELECT id FROM ro_q9), 'Îi pui o pernă mare sub cap.', false, 1),
  ((SELECT id FROM ro_q9), 'Pui o mână pe frunte și faci hiperextensia capului, ridicând bărbia cu două degete.', true, 2),
  ((SELECT id FROM ro_q9), 'O întorci brusc pe burtă.', false, 3);

WITH ro_q10 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Unde se poziționează corect mâinile pentru compresiile toracice la adult?', 'rcp_adulti', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q10), 'Pe partea stângă a pieptului, deasupra inimii.', false, 0),
  ((SELECT id FROM ro_q10), 'Pe stomac.', false, 1),
  ((SELECT id FROM ro_q10), 'Pe mijlocul sternului (osul pieptului).', true, 2),
  ((SELECT id FROM ro_q10), 'Pe coastele din partea dreaptă.', false, 3);

WITH ro_q11 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este unghiul corect al brațelor salvatorului față de pieptul victimei în timpul compresiilor toracice?', 'rcp_adulti', 30, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q11), '45 de grade, cu coatele ușor îndoite.', false, 0),
  ((SELECT id FROM ro_q11), '90 de grade (perpendiculare), cu coatele ferm drepte (întinse).', true, 1),
  ((SELECT id FROM ro_q11), '60 de grade, apăsând din umeri.', false, 2),
  ((SELECT id FROM ro_q11), 'Nu contează unghiul, contează doar forța.', false, 3);

WITH ro_q12 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este adâncimea și frecvența corectă a compresiilor toracice la un adult?', 'rcp_adulti', 30, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q12), '2-3 cm adâncime, 60-80 compresii pe minut.', false, 0),
  ((SELECT id FROM ro_q12), '5-6 cm adâncime, 100-120 compresii pe minut.', true, 1),
  ((SELECT id FROM ro_q12), '7-8 cm adâncime, 140 compresii pe minut.', false, 2),
  ((SELECT id FROM ro_q12), '10 cm adâncime, 100 compresii pe minut.', false, 3);

WITH ro_q13 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este raportul corect între compresiile toracice și ventilații (respirații gură la gură) la adult?', 'rcp_adulti', 10, 15, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q13), '15 compresii : 2 ventilații', false, 0),
  ((SELECT id FROM ro_q13), '30 compresii : 2 ventilații', true, 1),
  ((SELECT id FROM ro_q13), '5 compresii : 1 ventilație', false, 2),
  ((SELECT id FROM ro_q13), '50 compresii : 5 ventilații', false, 3);

WITH ro_q14 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('De unde trebuie să provină forța atunci când execuți compresiile toracice?', 'rcp_adulti', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q14), 'Din mușchii brațelor.', false, 0),
  ((SELECT id FROM ro_q14), 'Din încheieturile mâinilor.', false, 1),
  ((SELECT id FROM ro_q14), 'Din greutatea propriului corp, nu doar din brațe.', true, 2),
  ((SELECT id FROM ro_q14), 'Din mușchii spatelui.', false, 3);

WITH ro_q15 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Când este cel mai eficient să folosești un defibrilator (AED) pentru a crește șansele de supraviețuire?', 'aed', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q15), 'După 15 minute de la stopul cardiac.', false, 0),
  ((SELECT id FROM ro_q15), 'În primele 3-5 minute.', true, 1),
  ((SELECT id FROM ro_q15), 'Doar după ce sosește ambulanța.', false, 2),
  ((SELECT id FROM ro_q15), 'După ce victima se trezește.', false, 3);

WITH ro_q16 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Ce trebuie să faci când aparatul AED dă comanda "NU ATINGEȚI PACIENTUL"?', 'aed', 10, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q16), 'Continui masajul cardiac mai încet.', false, 0),
  ((SELECT id FROM ro_q16), 'Te asiguri că nimeni nu atinge victima, deoarece aparatul analizează ritmul cardiac sau administrează șocul.', true, 1),
  ((SELECT id FROM ro_q16), 'Îi verifici pulsul.', false, 2),
  ((SELECT id FROM ro_q16), 'Muți electrozii.', false, 3);

WITH ro_q17 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Ce faci cu electrozii defibrilatorului dacă victima începe să respire sau pe parcursul resuscitării?', 'aed', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q17), 'Îi dezlipești și oprești aparatul.', false, 0),
  ((SELECT id FROM ro_q17), 'Îi muți pe spate.', false, 1),
  ((SELECT id FROM ro_q17), 'Îi lași lipiți pe piept, deoarece aparatul te va ajuta în continuare.', true, 2),
  ((SELECT id FROM ro_q17), 'Îi speli cu apă și îi pui la loc.', false, 3);

WITH ro_q18 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cine decide dacă victima are nevoie de șoc electric?', 'aed', 10, 15, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q18), 'Salvatorul care acordă primul ajutor.', false, 0),
  ((SELECT id FROM ro_q18), 'Martorii din jur.', false, 1),
  ((SELECT id FROM ro_q18), 'Defibrilatorul (AED) în urma analizei ritmului cardiac.', true, 2),
  ((SELECT id FROM ro_q18), 'Medicul, prin telefon.', false, 3);

WITH ro_q19 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Când se folosește Poziția Laterală de Siguranță (PLS)?', 'pls', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q19), 'Când victima este inconștientă și NU respiră.', false, 0),
  ((SELECT id FROM ro_q19), 'Când victima este conștientă, dar o doare burta.', false, 1),
  ((SELECT id FROM ro_q19), 'Când victima este inconștientă, DAR respiră normal și are puls.', true, 2),
  ((SELECT id FROM ro_q19), 'În caz de hemoragie arterială la o mână.', false, 3);

WITH ro_q20 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este principalul scop al Poziției Laterale de Siguranță?', 'pls', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q20), 'Să încălzească victima.', false, 0),
  ((SELECT id FROM ro_q20), 'Să prevină blocarea căilor respiratorii cu propria limbă, secreții sau vărsături.', true, 1),
  ((SELECT id FROM ro_q20), 'Să oprească o sângerare.', false, 2),
  ((SELECT id FROM ro_q20), 'Să reducă durerea de spate.', false, 3);

WITH ro_q21 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cum trebuie poziționat capul victimei aflată în PLS?', 'pls', 30, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q21), 'Cât mai aplecat în față (bărbia în piept).', false, 0),
  ((SELECT id FROM ro_q21), 'Ușor înclinat pe spate (hiperextensie) cu gura orientată în jos pentru scurgerea fluidelor.', true, 1),
  ((SELECT id FROM ro_q21), 'Drept, perfect aliniat cu coloana.', false, 2),
  ((SELECT id FROM ro_q21), 'Sprijinit pe o pernă înaltă.', false, 3);

WITH ro_q22 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Dacă ambulanța întârzie, după cât timp trebuie să întorci victima aflată în PLS pe cealaltă parte?', 'pls', 30, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q22), 'După 5 minute.', false, 0),
  ((SELECT id FROM ro_q22), 'După 15 minute.', false, 1),
  ((SELECT id FROM ro_q22), 'După 30 de minute, pentru a evita compresia îndelungată pe un singur braț.', true, 2),
  ((SELECT id FROM ro_q22), 'Nu trebuie întoarsă niciodată.', false, 3);

WITH ro_q23 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cum reacționezi dacă o persoană se îneacă cu mâncare, dar poate vorbi și tuși puternic (obstrucție parțială)?', 'dezobstructie', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q23), 'O bați puternic pe spate imediat.', false, 0),
  ((SELECT id FROM ro_q23), 'Îi aplici manevra Heimlich.', false, 1),
  ((SELECT id FROM ro_q23), 'O încurajezi să tușească și o supraveghezi, fără să intervii forțat.', true, 2),
  ((SELECT id FROM ro_q23), 'Îi dai să bea multă apă.', false, 3);

WITH ro_q24 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cum se aplică corect Manevra Heimlich la un adult conștient?', 'dezobstructie', 30, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q24), 'Pumnul pe stern, apeși în jos.', false, 0),
  ((SELECT id FROM ro_q24), 'Pumnul între ombilic și stern, cealaltă mână deasupra, tragi brusc spre tine și în sus.', true, 1),
  ((SELECT id FROM ro_q24), 'Palmele pe coaste, apeși lateral.', false, 2),
  ((SELECT id FROM ro_q24), 'Bați cu pumnul în spatele capului.', false, 3);

WITH ro_q25 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Câte lovituri interscapulare (între omoplați) se aplică inițial unei persoane cu obstrucție completă?', 'dezobstructie', 10, 15, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q25), '2 lovituri', false, 0),
  ((SELECT id FROM ro_q25), '3 lovituri', false, 1),
  ((SELECT id FROM ro_q25), '5 lovituri', true, 2),
  ((SELECT id FROM ro_q25), '10 lovituri', false, 3);

WITH ro_q26 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cum se modifică manevra Heimlich pentru persoanele obeze sau femeile gravide?', 'dezobstructie', 30, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q26), 'Se face exact la fel.', false, 0),
  ((SELECT id FROM ro_q26), 'Se aplică doar lovituri pe spate, niciodată compresii.', false, 1),
  ((SELECT id FROM ro_q26), 'Compresiile nu se fac pe abdomen, ci la nivelul părții inferioare a sternului (pe piept).', true, 2),
  ((SELECT id FROM ro_q26), 'Se așează persoana pe jos și se apasă pe burtă.', false, 3);

WITH ro_q27 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Ce faci imediat dacă persoana care s-a înecat cu un corp străin devine inconștientă?', 'dezobstructie', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q27), 'O pui în Poziția Laterală de Siguranță.', false, 0),
  ((SELECT id FROM ro_q27), 'Continui manevra Heimlich pe podea.', false, 1),
  ((SELECT id FROM ro_q27), 'O așezi pe spate, suni la 112 și începi resuscitarea cardio-pulmonară (compresii toracice).', true, 2),
  ((SELECT id FROM ro_q27), 'Încerci să îi bagi degetele în gât orbește.', false, 3);

WITH ro_q28 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este primul pas diferit în resuscitarea unui copil față de un adult, dacă acesta nu respiră?', 'copii_sugari', 30, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q28), 'Se aplică direct șocul electric.', false, 0),
  ((SELECT id FROM ro_q28), 'Se oferă inițial 5 respirații salvatoare, înainte de compresiile toracice.', true, 1),
  ((SELECT id FROM ro_q28), 'Se fac 15 compresii toracice.', false, 2),
  ((SELECT id FROM ro_q28), 'Se sună la 112 abia după 10 minute.', false, 3);

WITH ro_q29 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cum se efectuează compresiile toracice la un bebeluș (sub 1 an)?', 'copii_sugari', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q29), 'Cu ambele mâini.', false, 0),
  ((SELECT id FROM ro_q29), 'Cu podul unei singure palme.', false, 1),
  ((SELECT id FROM ro_q29), 'Cu 2 degete pe mijlocul pieptului.', true, 2),
  ((SELECT id FROM ro_q29), 'Cu degetele mari, strângând cutia toracică.', false, 3);

WITH ro_q30 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cum aplici primul ajutor unui bebeluș care s-a înecat cu o jucărie mică (obstrucție totală)?', 'copii_sugari', 30, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q30), 'Îi faci manevra Heimlich de abdomen, ca la adult.', false, 0),
  ((SELECT id FROM ro_q30), 'Îl ții de picioare cu capul în jos și îl scuturi.', false, 1),
  ((SELECT id FROM ro_q30), 'Aplici 5 lovituri între omoplați, urmate de 5 apăsări pe piept (cu 2 degete).', true, 2),
  ((SELECT id FROM ro_q30), 'Îi dai să bea lapte fierbinte.', false, 3);

WITH ro_q31 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('La ce adâncime se fac compresiile toracice la copii?', 'copii_sugari', 30, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q31), '1-2 cm.', false, 0),
  ((SELECT id FROM ro_q31), '5-6 cm, exact ca la adult.', false, 1),
  ((SELECT id FROM ro_q31), 'Aproximativ o treime din grosimea pieptului (aprox. 4 cm bebeluș, 5 cm copil).', true, 2),
  ((SELECT id FROM ro_q31), 'Până auzi un "poc".', false, 3);

WITH ro_q32 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care acțiune este strict INTERZISĂ când cineva are o criză de epilepsie (convulsii)?', 'urgente_medicale', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q32), 'Îndepărtarea obiectelor din jur cu care s-ar putea răni.', false, 0),
  ((SELECT id FROM ro_q32), 'Să-i bagi forțat un obiect în gură pentru a nu-și înghiți limba sau a-l imobiliza cu forța.', true, 1),
  ((SELECT id FROM ro_q32), 'Așezarea unui material moale sub cap.', false, 2),
  ((SELECT id FROM ro_q32), 'Cronometrarea duratei crizei.', false, 3);

WITH ro_q33 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Ce trebuie să faci dacă o persoană leșină (își pierde cunoștința pentru scurt timp)?', 'urgente_medicale', 10, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q33), 'O stropești imediat cu apă rece pe față.', false, 0),
  ((SELECT id FROM ro_q33), 'O așezi pe spate și îi ridici puțin picioarele pentru a ajuta circulația sângelui spre creier.', true, 1),
  ((SELECT id FROM ro_q33), 'O pui în șezut și îi dai palme.', false, 2),
  ((SELECT id FROM ro_q33), 'Îi dai să bea apă cu zahăr imediat, deși e inconștientă.', false, 3);

WITH ro_q34 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care dintre următoarele NU este un declanșator frecvent al șocului anafilactic?', 'urgente_medicale', 10, 15, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q34), 'Alunele.', false, 0),
  ((SELECT id FROM ro_q34), 'Înțepăturile de albine.', false, 1),
  ((SELECT id FROM ro_q34), 'Apa plată.', true, 2),
  ((SELECT id FROM ro_q34), 'Penicilina.', false, 3);

WITH ro_q35 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este tratamentul de urgență pe care îl poți administra (dacă există) în caz de anafilaxie?', 'urgente_medicale', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q35), 'O pastilă de paracetamol.', false, 0),
  ((SELECT id FROM ro_q35), 'Auto-injectorul cu adrenalină (EpiPen), administrat în coapsă.', true, 1),
  ((SELECT id FROM ro_q35), 'O sticlă cu apă rece.', false, 2),
  ((SELECT id FROM ro_q35), 'Un inhalator pentru astm.', false, 3);

WITH ro_q36 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Ce trebuie să faci imediat DUPĂ ce o criză de epilepsie s-a încheiat, iar pacientul este încă inconștient, dar respiră?', 'urgente_medicale', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q36), 'Îl întorci în Poziția Laterală de Siguranță (PLS).', true, 0),
  ((SELECT id FROM ro_q36), 'Îi faci masaj cardiac.', false, 1),
  ((SELECT id FROM ro_q36), 'Îl ajuți să se ridice în picioare.', false, 2),
  ((SELECT id FROM ro_q36), 'Îl lași pe spate cu picioarele ridicate.', false, 3);

WITH ro_q37 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cum asiguri căile aeriene la o victimă pe care o suspectezi de traumatism la coloana cervicală (ex: accident rutier)?', 'trauma', 30, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q37), 'Faci hiperextensia puternică a capului.', false, 0),
  ((SELECT id FROM ro_q37), 'Răsucești gâtul spre stânga.', false, 1),
  ((SELECT id FROM ro_q37), 'Folosești subluxația mandibulei (ridici bărbia fără să miști gâtul).', true, 2),
  ((SELECT id FROM ro_q37), 'Nu te atingi de căile aeriene.', false, 3);

WITH ro_q38 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cum recunoști o hemoragie arterială (cea mai periculoasă)?', 'trauma', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q38), 'Sângele se scurge lent și este închis la culoare.', false, 0),
  ((SELECT id FROM ro_q38), 'Sângele este roșu aprins și țâșnește pulsatil (în ritmul inimii).', true, 1),
  ((SELECT id FROM ro_q38), 'Sângele este amestecat cu puroi.', false, 2),
  ((SELECT id FROM ro_q38), 'Sângele este doar la suprafața zgârieturii.', false, 3);

WITH ro_q39 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este primul pas în acordarea primului ajutor pentru o hemoragie externă abundentă?', 'trauma', 20, 15, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q39), 'Spălarea rănii cu apă oxigenată.', false, 0),
  ((SELECT id FROM ro_q39), 'Aplicarea unui garou direct pe gât.', false, 1),
  ((SELECT id FROM ro_q39), 'Aplicarea de presiune directă pe rană cu o compresă și ridicarea membrului afectat.', true, 2),
  ((SELECT id FROM ro_q39), 'Așteptarea coagulării naturale.', false, 3);

WITH ro_q40 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este regula de aur dacă găsești o victimă a unei căderi de la înălțime care este conștientă?', 'trauma', 10, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q40), 'O pui rapid în Poziția Laterală de Siguranță.', false, 0),
  ((SELECT id FROM ro_q40), 'O ajuți să se ridice și să meargă.', false, 1),
  ((SELECT id FROM ro_q40), 'NU o miști absolut deloc până nu vin salvatorii, decât dacă viața ei este în pericol iminent (foc, explozie).', true, 2),
  ((SELECT id FROM ro_q40), 'O urci în mașina ta și mergi la spital.', false, 3);

WITH ro_q41 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('În cazul unei arsuri termice proaspete, ce spune "Regula de 10"?', 'arsuri', 30, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q41), 'Aplică 10 cuburi de gheață timp de 10 secunde.', false, 0),
  ((SELECT id FROM ro_q41), 'Apă de la robinet la aprox. 10 grade, aplicată timp de 10 minute, de la o distanță de 10 cm.', true, 1),
  ((SELECT id FROM ro_q41), 'Aplică o cremă de 10 ori pe parcursul a 10 ore.', false, 2),
  ((SELECT id FROM ro_q41), 'Bea 10 pahare cu apă.', false, 3);

WITH ro_q42 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Ce ACȚIUNE ESTE INTERZISĂ atunci când acorzi primul ajutor pentru o arsură?', 'arsuri', 10, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q42), 'Răcirea cu apă.', false, 0),
  ((SELECT id FROM ro_q42), 'Îndepărtarea inelelor sau ceasurilor înainte de umflarea pielii.', false, 1),
  ((SELECT id FROM ro_q42), 'Spargerea veziculelor (bășicilor) cu lichid și aplicarea de ulei, iaurt sau făină.', true, 2),
  ((SELECT id FROM ro_q42), 'Acoperirea cu un pansament curat și uscat.', false, 3);

WITH ro_q43 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cât timp trebuie spălat cu un jet continuu de apă rece un ochi afectat de o arsură chimică?', 'arsuri', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q43), '1 minut.', false, 0),
  ((SELECT id FROM ro_q43), '3 minute.', false, 1),
  ((SELECT id FROM ro_q43), 'Cel puțin 10-20 de minute.', true, 2),
  ((SELECT id FROM ro_q43), 'Nu se spală cu apă, ci se șterge cu un prosop.', false, 3);

WITH ro_q44 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Care este PRIMUL lucru pe care trebuie să-l faci când găsești o persoană electrocutată care încă atinge sursa?', 'arsuri', 10, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q44), 'Tragi victima de mâini cât mai repede.', false, 0),
  ((SELECT id FROM ro_q44), 'Torni apă peste ea pentru a stinge posibilele arsuri.', false, 1),
  ((SELECT id FROM ro_q44), 'Întrerupi sursa de energie electrică (scoți ștecherul, oprești siguranța) înainte de a o atinge.', true, 2),
  ((SELECT id FROM ro_q44), 'Îi faci manevra Heimlich.', false, 3);

WITH ro_q45 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('De ce sunt arsurile electrice considerate extrem de periculoase, chiar dacă rana exterioară pare mică?', 'arsuri', 30, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q45), 'Pentru că provoacă alergii grave.', false, 0),
  ((SELECT id FROM ro_q45), 'Pentru că "drumul" curentului prin corp poate distruge mușchi, vase de sânge și poate afecta inima și creierul.', true, 1),
  ((SELECT id FROM ro_q45), 'Pentru că se vindecă cu semne inestetice.', false, 2),
  ((SELECT id FROM ro_q45), 'Pentru că victima se poate îmbolnăvi de gripă.', false, 3);

WITH ro_q46 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cum se realizează corect încălzirea unui pacient cu hipotermie (ex: scos dintr-un râu înghețat)?', 'intoxicatii', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q46), 'Foarte brusc, băgat direct într-o baie cu apă clocotită.', false, 0),
  ((SELECT id FROM ro_q46), 'Treptat, îndepărtând hainele ude și acoperindu-l cu pături uscate, fără a-l freca.', true, 1),
  ((SELECT id FROM ro_q46), 'Oferindu-i imediat mult alcool de băut.', false, 2),
  ((SELECT id FROM ro_q46), 'Frecându-i puternic pielea pentru a genera frecare.', false, 3);

WITH ro_q47 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Ce NU trebuie să faci atunci când scoți din apă o victimă a înecului care nu respiră?', 'intoxicatii', 20, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q47), 'Să suni la 112.', false, 0),
  ((SELECT id FROM ro_q47), 'Să încerci să scurgi apa din plămânii ei presându-i burta.', true, 1),
  ((SELECT id FROM ro_q47), 'Să începi resuscitarea cardio-pulmonară (RCP).', false, 2),
  ((SELECT id FROM ro_q47), 'Să o pui pe o suprafață plană, dură.', false, 3);

WITH ro_q48 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Ce manifestări sugerează o urgență extremă (formă severă) de hipertermie (insolație gravă / heat stroke)?', 'intoxicatii', 30, 30, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q48), 'Piele rece, tremurături, buze vinete.', false, 0),
  ((SELECT id FROM ro_q48), 'Tuse cu sânge.', false, 1),
  ((SELECT id FROM ro_q48), 'Temperatură foarte mare a corpului, confuzie/comă, piele fierbinte, absența transpirației.', true, 2),
  ((SELECT id FROM ro_q48), 'Dureri de stomac și vedere îmbunătățită.', false, 3);

WITH ro_q49 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Cum procedezi în cazul unei intoxicații cu Monoxid de Carbon (gaz incolor, inodor)?', 'intoxicatii', 10, 20, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q49), 'Pui pacientul în Poziția Laterală de Siguranță direct în camera respectivă.', false, 0),
  ((SELECT id FROM ro_q49), 'Scoți victima imediat la aer curat, aerisești încăperea și suni la 112.', true, 1),
  ((SELECT id FROM ro_q49), 'Îi dai să bea lapte.', false, 2),
  ((SELECT id FROM ro_q49), 'Aștepți să vezi dacă îi trece durerea de cap.', false, 3);

WITH ro_q50 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Sub ce valoare trebuie să scadă temperatura corpului pentru a se instala hipotermia?', 'intoxicatii', 20, 15, 'ro') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM ro_q50), 'Sub 37°C', false, 0),
  ((SELECT id FROM ro_q50), 'Sub 36°C', false, 1),
  ((SELECT id FROM ro_q50), 'Sub 35°C', true, 2),
  ((SELECT id FROM ro_q50), 'Sub 30°C', false, 3);


-- =============================================================================
-- 5. SEED 50 ENGLISH QUESTIONS (language = 'en')
-- =============================================================================

WITH en_q1 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Under first aid legislation and emergency protocols, who is authorized to provide basic first aid?', 'siguranta', 10, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q1), 'Only licensed physicians and registered nurses.', false, 0),
  ((SELECT id FROM en_q1), 'Any bystander, even without prior medical training, if following 112/911 dispatcher instructions.', true, 1),
  ((SELECT id FROM en_q1), 'Only police officers and firefighters.', false, 2),
  ((SELECT id FROM en_q1), 'Only individuals over 18 years of age.', false, 3);

WITH en_q2 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the primary and most critical first step before administering first aid?', 'siguranta', 10, 15, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q2), 'Checking the victim''''s breathing.', false, 0),
  ((SELECT id FROM en_q2), 'Immediately calling the emergency dispatch number.', false, 1),
  ((SELECT id FROM en_q2), 'Ensuring personal safety and scene safety.', true, 2),
  ((SELECT id FROM en_q2), 'Initiating chest compressions immediately.', false, 3);

WITH en_q3 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What should you do if you witness a drowning incident but do not know how to swim?', 'siguranta', 10, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q3), 'Jump into the water immediately because the victim''''s life is more important.', false, 0),
  ((SELECT id FROM en_q3), 'Find a reaching object (branch, pole, rope) and call 112/911 without putting yourself in danger.', true, 1),
  ((SELECT id FROM en_q3), 'Leave the scene to look for a doctor.', false, 2),
  ((SELECT id FROM en_q3), 'Wait on the shore until the victim gets out on their own.', false, 3);

WITH en_q4 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the correct sequence of the first 3 links in the "Chain of Survival"?', 'siguranta', 20, 30, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q4), 'Emergency Call -> CPR -> Defibrillation', false, 0),
  ((SELECT id FROM en_q4), 'Rescuer Safety -> Early Recognition & Emergency Call -> Early CPR', true, 1),
  ((SELECT id FROM en_q4), 'Emergency Recognition -> CPR -> Emergency Call', false, 2),
  ((SELECT id FROM en_q4), 'Rescuer Safety -> Defibrillation -> CPR', false, 3);

WITH en_q5 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('When are you allowed to stop performing Cardiopulmonary Resuscitation (CPR)?', 'siguranta', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q5), 'After exactly 5 minutes of compressions.', false, 0),
  ((SELECT id FROM en_q5), 'When the victim shows signs of life, emergency medical personnel arrive, or you are completely physically exhausted.', true, 1),
  ((SELECT id FROM en_q5), 'When a crowd gathers around the scene.', false, 2),
  ((SELECT id FROM en_q5), 'If the victim does not regain consciousness after 3 compression cycles.', false, 3);

WITH en_q6 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the correct protocol when calling emergency dispatch (112/911)?', 'evaluare_112', 10, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q6), 'Give the address quickly and hang up immediately to resume CPR.', false, 0),
  ((SELECT id FROM en_q6), 'Answer all questions calmly, provide exact location, and never hang up until instructed by dispatch.', true, 1),
  ((SELECT id FROM en_q6), 'Yell at the dispatcher to send an ambulance faster.', false, 2),
  ((SELECT id FROM en_q6), 'Call only after finishing all first aid maneuvers.', false, 3);

WITH en_q7 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What does the clinical assessment acronym "LLF" (Look, Listen, Feel) signify in breathing checks?', 'evaluare_112', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q7), 'Look for chest rise, Listen for breath sounds, Feel exhaled air on your cheek.', true, 0),
  ((SELECT id FROM en_q7), 'Pressure, Airway, Blood circulation.', false, 1),
  ((SELECT id FROM en_q7), 'Legs, Abdomen, Spine inspection.', false, 2),
  ((SELECT id FROM en_q7), 'Locate, Press, Save.', false, 3);

WITH en_q8 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the MAXIMUM time you should take to assess if an unconscious victim is breathing normally?', 'evaluare_112', 20, 15, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q8), '5 seconds', false, 0),
  ((SELECT id FROM en_q8), '10 seconds', true, 1),
  ((SELECT id FROM en_q8), '30 seconds', false, 2),
  ((SELECT id FROM en_q8), '1 minute', false, 3);

WITH en_q9 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Letter "A" in the ABC protocol stands for Airway. How do you properly open the airway in a victim without suspected spinal trauma?', 'evaluare_112', 20, 30, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q9), 'Pull the victim''''s tongue with your fingers.', false, 0),
  ((SELECT id FROM en_q9), 'Place a large pillow under their head.', false, 1),
  ((SELECT id FROM en_q9), 'Perform a head-tilt chin-lift maneuver by placing one hand on the forehead and lifting the chin with two fingers.', true, 2),
  ((SELECT id FROM en_q9), 'Turn the victim abruptly onto their stomach.', false, 3);

WITH en_q10 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Where should hands be positioned on an adult victim for effective chest compressions?', 'rcp_adulti', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q10), 'On the left side of the chest directly over the heart.', false, 0),
  ((SELECT id FROM en_q10), 'On the upper abdomen below the ribs.', false, 1),
  ((SELECT id FROM en_q10), 'In the center of the chest on the lower half of the sternum (breastbone).', true, 2),
  ((SELECT id FROM en_q10), 'Over the right lower ribcage.', false, 3);

WITH en_q11 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the correct angle of the rescuer''''s arms relative to the victim''''s chest during compressions?', 'rcp_adulti', 30, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q11), '45 degrees with elbows slightly bent.', false, 0),
  ((SELECT id FROM en_q11), '90 degrees (perpendicular) with elbows locked straight.', true, 1),
  ((SELECT id FROM en_q11), '60 degrees pressing predominantly with shoulder muscles.', false, 2),
  ((SELECT id FROM en_q11), 'The angle does not matter as long as maximum force is applied.', false, 3);

WITH en_q12 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the target compression depth and rate for adult CPR according to international guidelines?', 'rcp_adulti', 30, 30, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q12), '2-3 cm depth, 60-80 compressions per minute.', false, 0),
  ((SELECT id FROM en_q12), '5-6 cm (approx. 2 inches) depth, at a rate of 100-120 compressions per minute.', true, 1),
  ((SELECT id FROM en_q12), '7-9 cm depth, at least 140 compressions per minute.', false, 2),
  ((SELECT id FROM en_q12), '4 cm depth, 80-100 compressions per minute.', false, 3);

WITH en_q13 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the standard ratio of chest compressions to rescue breaths in adult CPR?', 'rcp_adulti', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q13), '15 compressions to 2 rescue breaths.', false, 0),
  ((SELECT id FROM en_q13), '30 compressions to 2 rescue breaths.', true, 1),
  ((SELECT id FROM en_q13), '30 compressions to 5 rescue breaths.', false, 2),
  ((SELECT id FROM en_q13), '50 compressions to 2 rescue breaths.', false, 3);

WITH en_q14 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the protocol if a lay rescuer is unable or untrained to deliver rescue breaths?', 'rcp_adulti', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q14), 'Stop resuscitation and wait for paramedics.', false, 0),
  ((SELECT id FROM en_q14), 'Perform continuous "Hands-Only" chest compressions without interruptions at 100-120 bpm.', true, 1),
  ((SELECT id FROM en_q14), 'Turn the victim onto their side.', false, 2),
  ((SELECT id FROM en_q14), 'Give only rescue breaths without compressions.', false, 3);

WITH en_q15 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the very first step you must take as soon as an Automated External Defibrillator (AED) arrives?', 'aed', 10, 15, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q15), 'Apply the electrode pads to the chest immediately.', false, 0),
  ((SELECT id FROM en_q15), 'Turn ON the AED device (power button or opening lid).', true, 1),
  ((SELECT id FROM en_q15), 'Deliver an immediate shock.', false, 2),
  ((SELECT id FROM en_q15), 'Disconnect the victim from any clothing.', false, 3);

WITH en_q16 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Where are standard adult AED electrode pads placed on the victim''''s bare chest?', 'aed', 20, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q16), 'Both pads placed horizontally across the lower abdomen.', false, 0),
  ((SELECT id FROM en_q16), 'One on the upper right chest (below collarbone), one on the lower left ribcage (mid-axillary line).', true, 1),
  ((SELECT id FROM en_q16), 'One on the center of the chest, one directly on the forehead.', false, 2),
  ((SELECT id FROM en_q16), 'Both pads on the left side over the heart.', false, 3);

WITH en_q17 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What must you ensure when the AED announces: "Analyzing heart rhythm, do not touch the patient"?', 'aed', 20, 15, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q17), 'Increase chest compression speed.', false, 0),
  ((SELECT id FROM en_q17), 'Ensure nobody is touching the victim and shout "STAND CLEAR!".', true, 1),
  ((SELECT id FROM en_q17), 'Deliver rescue breaths.', false, 2),
  ((SELECT id FROM en_q17), 'Turn off the AED.', false, 3);

WITH en_q18 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What should you do immediately after a shock is delivered by the AED (or if no shock is advised)?', 'aed', 30, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q18), 'Wait 2 minutes without touching the patient.', false, 0),
  ((SELECT id FROM en_q18), 'Resume chest compressions (CPR) immediately starting with 30 compressions.', true, 1),
  ((SELECT id FROM en_q18), 'Remove the electrode pads from the chest.', false, 2),
  ((SELECT id FROM en_q18), 'Check pulse for 1 minute.', false, 3);

WITH en_q19 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Which victim profile is eligible for placement into the Recovery Position (PLS)?', 'pls', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q19), 'Unconscious, NOT breathing (cardiac arrest).', false, 0),
  ((SELECT id FROM en_q19), 'Unconscious, but breathing NORMALLY, without suspected spinal trauma.', true, 1),
  ((SELECT id FROM en_q19), 'Conscious victim with a broken arm.', false, 2),
  ((SELECT id FROM en_q19), 'Victim with severe visible spinal injury.', false, 3);

WITH en_q20 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the primary medical objective of placing an unconscious breathing victim in the Recovery Position?', 'pls', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q20), 'To help the victim fall asleep comfortably.', false, 0),
  ((SELECT id FROM en_q20), 'Maintaining a patent airway and preventing aspiration of vomitus or tongue obstruction.', true, 1),
  ((SELECT id FROM en_q20), 'To stop external bleeding from limbs.', false, 2),
  ((SELECT id FROM en_q20), 'To reduce body temperature.', false, 3);

WITH en_q21 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('In what position is the victim''''s top leg placed when rolling them into the Recovery Position?', 'pls', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q21), 'Bent at both hip and knee at a 90-degree angle to stabilize the body.', true, 0),
  ((SELECT id FROM en_q21), 'Completely straight resting on the lower leg.', false, 1),
  ((SELECT id FROM en_q21), 'Crossed behind the bottom knee.', false, 2),
  ((SELECT id FROM en_q21), 'Elevated above the chest level.', false, 3);

WITH en_q22 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('How often should you re-evaluate the breathing of a victim placed in the Recovery Position?', 'pls', 10, 15, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q22), 'Only when the ambulance arrives.', false, 0),
  ((SELECT id FROM en_q22), 'Continuously (every 1-2 minutes) until medical help arrives.', true, 1),
  ((SELECT id FROM en_q22), 'Every 15 minutes.', false, 2),
  ((SELECT id FROM en_q22), 'Once after 10 minutes.', false, 3);

WITH en_q23 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the first step for a conscious adult showing signs of MILD (partial) airway obstruction who can still cough forcefully?', 'dezobstructie', 10, 15, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q23), 'Perform abdominal thrusts (Heimlich maneuver) immediately.', false, 0),
  ((SELECT id FROM en_q23), 'Encourage the victim to continue coughing forcefully, without intervening mechanically.', true, 1),
  ((SELECT id FROM en_q23), 'Offer them a large glass of water to drink.', false, 2),
  ((SELECT id FROM en_q23), 'Slap them on the lower back while sitting.', false, 3);

WITH en_q24 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the universal distress sign for severe airway obstruction (choking)?', 'dezobstructie', 10, 15, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q24), 'Clutching the throat/neck with both hands, inability to speak or breathe.', true, 0),
  ((SELECT id FROM en_q24), 'Holding the stomach and screaming for help.', false, 1),
  ((SELECT id FROM en_q24), 'Rubbing the temples and closing eyes.', false, 2),
  ((SELECT id FROM en_q24), 'Excessive continuous sneezing.', false, 3);

WITH en_q25 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the recommended protocol for a conscious adult with SEVERE airway obstruction?', 'dezobstructie', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q25), '10 chest compressions followed by 2 breaths.', false, 0),
  ((SELECT id FROM en_q25), 'Alternate up to 5 firm back blows (between shoulder blades) with 5 abdominal thrusts (Heimlich).', true, 1),
  ((SELECT id FROM en_q25), 'Blind finger sweep in the throat.', false, 2),
  ((SELECT id FROM en_q25), 'Lay the patient flat on their back immediately.', false, 3);

WITH en_q26 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Where should your fist be positioned when executing abdominal thrusts (Heimlich maneuver) on an adult?', 'dezobstructie', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q26), 'Directly over the lower sternum (breastbone).', false, 0),
  ((SELECT id FROM en_q26), 'Between the navel (belly button) and the xiphoid process (bottom of breastbone).', true, 1),
  ((SELECT id FROM en_q26), 'Directly over the bladder.', false, 2),
  ((SELECT id FROM en_q26), 'On the left side of the lower abdomen.', false, 3);

WITH en_q27 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the mandatory action if a choking victim becomes UNCONSCIOUS and collapses?', 'dezobstructie', 30, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q27), 'Continue performing standing abdominal thrusts.', false, 0),
  ((SELECT id FROM en_q27), 'Lower them carefully to the ground, call 112, and start CPR compressions immediately (30:2).', true, 1),
  ((SELECT id FROM en_q27), 'Hang them upside down by the feet.', false, 2),
  ((SELECT id FROM en_q27), 'Pour water into their mouth to dislodge the object.', false, 3);

WITH en_q28 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('How do you correctly deliver back blows and chest thrusts for a choking INFANT (under 1 year)?', 'copii_sugari', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q28), 'Perform standard adult Heimlich abdominal thrusts with your fist.', false, 0),
  ((SELECT id FROM en_q28), 'Place infant face down along your forearm with head lower than chest, give 5 back blows, then flip face up for 5 chest thrusts.', true, 1),
  ((SELECT id FROM en_q28), 'Shake the infant gently by the shoulders.', false, 2),
  ((SELECT id FROM en_q28), 'Perform blind finger sweeps deep in the throat.', false, 3);

WITH en_q29 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the initial step when starting CPR on an unresponsive non-breathing CHILD or INFANT?', 'copii_sugari', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q29), 'Deliver 5 initial rescue breaths (ventilations) before starting chest compressions.', true, 0),
  ((SELECT id FROM en_q29), 'Perform 100 continuous compressions without air.', false, 1),
  ((SELECT id FROM en_q29), 'Administer an immediate adult AED shock.', false, 2),
  ((SELECT id FROM en_q29), 'Immerse in cold water.', false, 3);

WITH en_q30 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('How are chest compressions performed on an INFANT (under 1 year of age)?', 'copii_sugari', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q30), 'Using the heels of both interlocking hands with full body weight.', false, 0),
  ((SELECT id FROM en_q30), 'Using 2 fingers (or two-thumb encircling technique) compressing approx. 4 cm (1.5 inches) depth.', true, 1),
  ((SELECT id FROM en_q30), 'By pressing on the stomach area.', false, 2),
  ((SELECT id FROM en_q30), 'Compressions should never be done on infants.', false, 3);

WITH en_q31 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What technique is used for chest compressions in a CHILD aged 1 to puberty?', 'copii_sugari', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q31), 'One or two hands depending on child size, compressing approx. 5 cm (1/3 chest depth) at 100-120 bpm.', true, 0),
  ((SELECT id FROM en_q31), 'Only 1 finger with minimal pressure.', false, 1),
  ((SELECT id FROM en_q31), 'Always two hands with maximum adult force.', false, 2),
  ((SELECT id FROM en_q31), 'Compressions at 60 bpm depth of 1 cm.', false, 3);

WITH en_q32 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('If you are ALONE with an unresponsive child in cardiac arrest without a phone immediately at hand, what is the protocol?', 'copii_sugari', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q32), 'Leave immediately to find help before doing anything.', false, 0),
  ((SELECT id FROM en_q32), 'Perform 1 minute of CPR (5 breaths + cycles) before briefly pausing to call 112/911.', true, 1),
  ((SELECT id FROM en_q32), 'Wait 10 minutes to see if the child wakes up.', false, 2),
  ((SELECT id FROM en_q32), 'Administer CPR only if an AED is present.', false, 3);

WITH en_q33 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the first-line emergency medication for a severe allergic reaction (Anaphylaxis)?', 'urgente_medicale', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q33), 'Oral paracetamol / acetaminophen.', false, 0),
  ((SELECT id FROM en_q33), 'Intramuscular Epinephrine / Adrenaline (auto-injector like EpiPen) into the outer mid-thigh.', true, 1),
  ((SELECT id FROM en_q33), 'A warm glass of milk.', false, 2),
  ((SELECT id FROM en_q33), 'Cold compresses on the forehead.', false, 3);

WITH en_q34 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the correct protocol when assisting someone having an active generalized tonic-clonic epileptic seizure?', 'urgente_medicale', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q34), 'Force an object or spoon between their teeth to stop them from biting their tongue.', false, 0),
  ((SELECT id FROM en_q34), 'Protect head with soft padding, clear dangerous objects, time the seizure, and never restrain movements.', true, 1),
  ((SELECT id FROM en_q34), 'Restrain their arms and legs with full body weight.', false, 2),
  ((SELECT id FROM en_q34), 'Pour cold water on their face.', false, 3);

WITH en_q35 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What does the clinical stroke recognition acronym FAST stand for?', 'urgente_medicale', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q35), 'Face drooping, Arm weakness, Speech difficulty, Time to call emergency services.', true, 0),
  ((SELECT id FROM en_q35), 'Fever, Allergy, Shock, Trauma.', false, 1),
  ((SELECT id FROM en_q35), 'Feet, Abdomen, Spine, Temperature.', false, 2),
  ((SELECT id FROM en_q35), 'Faint, Anxious, Sweating, Tired.', false, 3);

WITH en_q36 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('How should a conscious person experiencing vasovagal syncope (simple fainting) be positioned?', 'urgente_medicale', 10, 15, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q36), 'Keep them standing and force them to walk.', false, 0),
  ((SELECT id FROM en_q36), 'Lay them flat on their back and elevate their legs approximately 30 cm (12 inches).', true, 1),
  ((SELECT id FROM en_q36), 'Place them in a tight seated position with head back.', false, 2),
  ((SELECT id FROM en_q36), 'Give them hot coffee immediately.', false, 3);

WITH en_q37 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the primary, most effective initial method to control severe external arterial bleeding?', 'trauma', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q37), 'Wash the wound with hydrogen peroxide and leave uncovered.', false, 0),
  ((SELECT id FROM en_q37), 'Apply firm, direct manual pressure over the bleeding site with a sterile dressing or clean cloth.', true, 1),
  ((SELECT id FROM en_q37), 'Apply ice directly to the exposed artery.', false, 2),
  ((SELECT id FROM en_q37), 'Apply a tourniquet around the neck.', false, 3);

WITH en_q38 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('When is the application of a commercial tactical tourniquet (CAT) indicated?', 'trauma', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q38), 'For minor superficial scratches and nosebleeds.', false, 0),
  ((SELECT id FROM en_q38), 'For catastrophic, life-threatening limb hemorrhage uncontrolled by direct pressure, or traumatic amputation.', true, 1),
  ((SELECT id FROM en_q38), 'For closed bone fractures without bleeding.', false, 2),
  ((SELECT id FROM en_q38), 'For all head and chest lacerations.', false, 3);

WITH en_q39 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the rule regarding an impaled foreign object (e.g. knife, metal shard) in a victim''''s body?', 'trauma', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q39), 'Pull the object out immediately to clean the wound.', false, 0),
  ((SELECT id FROM en_q39), 'DO NOT remove the object; stabilize it in place with bulky dressings to prevent fatal hemorrhage.', true, 1),
  ((SELECT id FROM en_q39), 'Push the object deeper to seal the artery.', false, 2),
  ((SELECT id FROM en_q39), 'Twist the object 90 degrees.', false, 3);

WITH en_q40 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('How should a severe nosebleed (epistaxis) be managed correctly?', 'trauma', 10, 15, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q40), 'Tilt head far backward and lie down flat.', false, 0),
  ((SELECT id FROM en_q40), 'Lean slightly forward, pinch the soft lower part of the nose firmly for 10-15 minutes, and breathe through the mouth.', true, 1),
  ((SELECT id FROM en_q40), 'Blow the nose vigorously every 2 minutes.', false, 2),
  ((SELECT id FROM en_q40), 'Drink hot fluids.', false, 3);

WITH en_q41 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the proper first aid protocol for an open (compound) bone fracture with bone protruding?', 'trauma', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q41), 'Push the protruding bone back inside the limb.', false, 0),
  ((SELECT id FROM en_q41), 'Cover wound with a sterile moist dressing, immobilize the joints above and below without repositioning bone, and call 112.', true, 1),
  ((SELECT id FROM en_q41), 'Encourage the victim to walk to test nerve function.', false, 2),
  ((SELECT id FROM en_q41), 'Apply boiling water to sterilize the bone.', false, 3);

WITH en_q42 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the primary first aid step for a fresh thermal burn?', 'arsuri', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q42), 'Apply butter, oil, toothpaste, or alcohol immediately.', false, 0),
  ((SELECT id FROM en_q42), 'Cool the burn under cool running tap water (10-20°C) for at least 10 to 20 minutes.', true, 1),
  ((SELECT id FROM en_q42), 'Pop any blisters that form.', false, 2),
  ((SELECT id FROM en_q42), 'Apply direct ice blocks directly to the burned skin.', false, 3);

WITH en_q43 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('Why must you NEVER apply ice directly to a burn injury?', 'arsuri', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q43), 'It can cause frostbite and further ischemic tissue necrosis on already damaged skin.', true, 0),
  ((SELECT id FROM en_q43), 'It increases pain sensitivity permanently.', false, 1),
  ((SELECT id FROM en_q43), 'It melts too quickly to have any effect.', false, 2),
  ((SELECT id FROM en_q43), 'It causes immediate skin discolouration.', false, 3);

WITH en_q44 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('How should clothing stuck to a deep, melted burn wound be handled?', 'arsuri', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q44), 'Rip the stuck fabric off with force.', false, 0),
  ((SELECT id FROM en_q44), 'Cut around the adherent fabric without forcibly removing pieces stuck to the burned flesh.', true, 1),
  ((SELECT id FROM en_q44), 'Soak the fabric in petroleum jelly.', false, 2),
  ((SELECT id FROM en_q44), 'Scrape the skin with a sterile blade.', false, 3);

WITH en_q45 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the first aid protocol for a chemical burn to the skin or eyes?', 'arsuri', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q45), 'Neutralize the chemical with an opposing acid or alkali immediately.', false, 0),
  ((SELECT id FROM en_q45), 'Flush copiously with continuous clean running water for at least 20 minutes and remove contaminated clothing.', true, 1),
  ((SELECT id FROM en_q45), 'Wipe with dry paper towels only.', false, 2),
  ((SELECT id FROM en_q45), 'Cover tightly with airtight plastic wrap without rinsing.', false, 3);

WITH en_q46 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What dressing should be used to cover a severe burn after thorough cooling?', 'arsuri', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q46), 'Fluffy cotton wool that sheds fibers.', false, 0),
  ((SELECT id FROM en_q46), 'Clean, sterile non-adherent dressing or clean plastic cling film applied loosely.', true, 1),
  ((SELECT id FROM en_q46), 'Adhesive duct tape.', false, 2),
  ((SELECT id FROM en_q46), 'Tight elastic bandage wrap.', false, 3);

WITH en_q47 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the correct treatment protocol for severe hypothermia?', 'intoxicatii', 20, 20, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q47), 'Place victim directly in a hot scalding bath and give alcohol.', false, 0),
  ((SELECT id FROM en_q47), 'Remove wet clothes, rewarm gradually in a warm environment with blankets, covering the head and core.', true, 1),
  ((SELECT id FROM en_q47), 'Force intense vigorous physical exercise.', false, 2),
  ((SELECT id FROM en_q47), 'Rub limbs vigorously with snow.', false, 3);

WITH en_q48 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('How do you differentiate between Heat Exhaustion and life-threatening Heat Stroke?', 'intoxicatii', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q48), 'Heat stroke presents with altered mental status / confusion, hot dry or flushed skin, and body temperature > 40°C.', true, 0),
  ((SELECT id FROM en_q48), 'Heat stroke is harmless and causes no temperature rise.', false, 1),
  ((SELECT id FROM en_q48), 'Heat exhaustion only occurs during winter.', false, 2),
  ((SELECT id FROM en_q48), 'There is no medical difference between the two.', false, 3);

WITH en_q49 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What should you NEVER do if a person has ingested a corrosive chemical or toxic petroleum product?', 'intoxicatii', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q49), 'Call 112 or poison control.', false, 0),
  ((SELECT id FROM en_q49), 'DO NOT induce vomiting (it re-burns the esophagus and risks fatal lung aspiration).', true, 1),
  ((SELECT id FROM en_q49), 'Keep the product container for medical identification.', false, 2),
  ((SELECT id FROM en_q49), 'Monitor breathing continuously.', false, 3);

WITH en_q50 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds, language) VALUES ('What is the primary action when rescuing a person found unconscious in an enclosed room with suspected Carbon Monoxide (CO) poisoning?', 'intoxicatii', 30, 25, 'en') RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM en_q50), 'Light a match to check air quality.', false, 0),
  ((SELECT id FROM en_q50), 'Ensure your own safety, ventilate space/doors immediately, evacuate victim to fresh outdoor air, and call 112.', true, 1),
  ((SELECT id FROM en_q50), 'Give the victim a hot meal.', false, 2),
  ((SELECT id FROM en_q50), 'Wait 30 minutes inside the room.', false, 3);
