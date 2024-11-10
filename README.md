# Othello Game

Un gioco di Othello implementato in JavaScript.

## Installazione

1. Clona il repository
2. Apri index.html nel browser

## Come giocare

 L'Othello si gioca in due, su un'othelliera di 8 caselle per lato, verde, con 64 pedine bicolori. Un giocatore ha il nero, l'avversario il bianco. La disposizione iniziale delle pedine sulla scacchiera è come in Figura 1. Inizia a giocare il Nero.

Al suo turno ogni giocatore poggia una pedina, con la faccia del proprio colore rivolta verso l'alto, su una casella ancora vuota (se uno dei due giocatori resta senza pedine, può usare quelle dell'avversario). Una pedina imprigiona quelle avversarie in una o più direzioni (orizzontale, verticale e/o diagonale), rendendo le pedine imprigionate del proprio colore (ovvero capovolgendole).

Il giocatore, al suo turno, è obbligato a giocare appoggiando una pedina in maniera da imprigionare almeno un disco avversario; non può porre una pedina in una casella senza girare dischi avversari, né girare meno di quelle richieste, né rinunciare alla mossa.

Nel caso in cui non vi siano mosse legali, il giocatore passa, e tocca nuovamente all'avversario, fino all'esaurimento delle mosse per entrambi i giocatori (in genere ciò avviene dopo aver riempito interamente di pedine la scacchiera).

Raramente può succedere che tutte le pedine diventino di un solo colore o che entrambi i giocatori non possano muovere anche se ci sono ancora caselle vuote, in tal caso la partita termina.

## Tecnologie utilizzate

- HTML5
- CSS3
- JavaScript 
