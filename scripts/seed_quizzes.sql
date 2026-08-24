-- Basic Life Support (BLS)
WITH q1 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('What is the recommended rate for performing chest compressions during CPR?', 'bls', 20, 15) RETURNING id),
     q2 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('What is the correct depth for chest compressions on an adult?', 'bls', 20, 15) RETURNING id),
     q3 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('When should you stop performing CPR once you have started?', 'bls', 20, 20) RETURNING id),
     q4 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('What is the first step you should take when you find an unresponsive adult?', 'bls', 20, 15) RETURNING id),
     q5 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('What does an AED do?', 'bls', 20, 15) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q1), '60-80 compressions per minute', false, 0),
  ((SELECT id FROM q1), '100-120 compressions per minute', true, 1),
  ((SELECT id FROM q1), '120-140 compressions per minute', false, 2),
  ((SELECT id FROM q1), '80-100 compressions per minute', false, 3),
  
  ((SELECT id FROM q2), 'At least 2 inches (5 cm)', true, 0),
  ((SELECT id FROM q2), '1 inch (2.5 cm)', false, 1),
  ((SELECT id FROM q2), 'As deep as possible', false, 2),
  ((SELECT id FROM q2), '0.5 inches (1.5 cm)', false, 3),
  
  ((SELECT id FROM q3), 'When you get tired', false, 0),
  ((SELECT id FROM q3), 'After 10 minutes', false, 1),
  ((SELECT id FROM q3), 'When medical professionals arrive and take over', true, 2),
  ((SELECT id FROM q3), 'When the person changes color', false, 3),

  ((SELECT id FROM q4), 'Begin chest compressions', false, 0),
  ((SELECT id FROM q4), 'Check for scene safety and call 112', true, 1),
  ((SELECT id FROM q4), 'Give 2 rescue breaths', false, 2),
  ((SELECT id FROM q4), 'Check for a pulse', false, 3),

  ((SELECT id FROM q5), 'It automatically performs chest compressions', false, 0),
  ((SELECT id FROM q5), 'It reads the heart rhythm and delivers a shock if needed', true, 1),
  ((SELECT id FROM q5), 'It restarts a completely stopped heart', false, 2),
  ((SELECT id FROM q5), 'It measures blood pressure', false, 3);

-- Choking
WITH q1 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('What is the universal sign for choking?', 'choking', 20, 15) RETURNING id),
     q2 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('If a person is coughing forcefully, what should you do?', 'choking', 20, 15) RETURNING id),
     q3 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('For a choking adult, where do you position your hands for abdominal thrusts?', 'choking', 20, 20) RETURNING id),
     q4 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('What is the proper technique for back blows?', 'choking', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q1), 'Waving hands in the air', false, 0),
  ((SELECT id FROM q1), 'Coughing loudly', false, 1),
  ((SELECT id FROM q1), 'Clutching the throat with both hands', true, 2),
  ((SELECT id FROM q1), 'Pointing to the stomach', false, 3),

  ((SELECT id FROM q2), 'Start back blows immediately', false, 0),
  ((SELECT id FROM q2), 'Encourage them to keep coughing', true, 1),
  ((SELECT id FROM q2), 'Perform the Heimlich maneuver', false, 2),
  ((SELECT id FROM q2), 'Give them a glass of water', false, 3),

  ((SELECT id FROM q3), 'On the center of the chest', false, 0),
  ((SELECT id FROM q3), 'Over the navel (belly button)', false, 1),
  ((SELECT id FROM q3), 'Just above the navel, below the ribcage', true, 2),
  ((SELECT id FROM q3), 'On their lower back', false, 3),

  ((SELECT id FROM q4), 'Hit them lightly with your fingertips', false, 0),
  ((SELECT id FROM q4), 'Use the heel of your hand between their shoulder blades', true, 1),
  ((SELECT id FROM q4), 'Slap their lower back', false, 2),
  ((SELECT id FROM q4), 'Use a closed fist on their upper back', false, 3);

-- Trauma
WITH q1 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('What is the first step in controlling severe bleeding?', 'trauma', 20, 15) RETURNING id),
     q2 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('Where should a tourniquet be placed relative to a severe wound?', 'trauma', 20, 20) RETURNING id),
     q3 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('When should you remove a tourniquet once it is applied?', 'trauma', 20, 15) RETURNING id),
     q4 AS (INSERT INTO questions (question_text, category, points, time_limit_seconds) VALUES ('If blood soaks through the first dressing during direct pressure, what should you do?', 'trauma', 20, 20) RETURNING id)
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
  ((SELECT id FROM q1), 'Apply a tourniquet immediately', false, 0),
  ((SELECT id FROM q1), 'Apply direct pressure with a clean cloth', true, 1),
  ((SELECT id FROM q1), 'Wash the wound with water', false, 2),
  ((SELECT id FROM q1), 'Elevate the limb above the heart', false, 3),

  ((SELECT id FROM q2), 'Directly over the wound', false, 0),
  ((SELECT id FROM q2), '2-3 inches above the wound (closer to the heart)', true, 1),
  ((SELECT id FROM q2), '2-3 inches below the wound', false, 2),
  ((SELECT id FROM q2), 'On the nearest joint', false, 3),

  ((SELECT id FROM q3), 'Every 15 minutes to let blood flow', false, 0),
  ((SELECT id FROM q3), 'When the bleeding seems to have stopped', false, 1),
  ((SELECT id FROM q3), 'Never. Only medical professionals should remove it', true, 2),
  ((SELECT id FROM q3), 'After exactly 2 hours', false, 3),

  ((SELECT id FROM q4), 'Remove it and put a fresh one on', false, 0),
  ((SELECT id FROM q4), 'Add more dressings on top of the first one', true, 1),
  ((SELECT id FROM q4), 'Take it off to check the wound', false, 2),
  ((SELECT id FROM q4), 'Stop pressing and apply a tourniquet', false, 3);
