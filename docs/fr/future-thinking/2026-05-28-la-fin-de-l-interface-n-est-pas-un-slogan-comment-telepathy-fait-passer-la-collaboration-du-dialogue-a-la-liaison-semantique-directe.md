<!-- Mis à jour : 2026-05-28 -->

# La fin de l'interface n'est pas un slogan : comment Telepathy fait passer la collaboration du dialogue à la liaison sémantique directe

Depuis deux ans, le « langage naturel » a été hissé sur un piédestal.  
Comme si, dès l'instant où les humains pouvaient bavarder avec une AI, une nouvelle ère s'ouvrait.

Je veux bien l'admettre : l'interface conversationnelle est un bond énorme.  
Mais si l'on veut vraiment que l'AI devienne un membre de la société, on se heurte vite à un mur :  
**le dialogue n'est pas un langage de collaboration.**

Les humains ne coopèrent pas parce qu'ils savent bavarder, mais parce qu'ils partagent en dessous un protocole sémantique commun :  
contrats, reçus, pièces justificatives, processus, rôles, responsabilité, procédures régulières. Rien de tout cela ne « se règle par le bavardage ».  
On peut décrire ces choses dans une conversation, on ne peut pas les remplacer par une conversation.

Au moment où iFay et coFay commencent à coopérer, où des Fays portent des services publics, où l'AI commence à « agir vers l'extérieur » au nom de quelqu'un —  
le dialogue devient le goulot d'étranglement le plus coûteux du système : lent, flou, facile à mal interpréter, difficile à auditer, difficile à examiner après coup.

C'est précisément le problème que le Telepathy Protocol vient résoudre.

## 1. « Sans UI » n'est pas une posture. Il s'agit d'arrêter la perte d'information

Une UI est, au fond, une couche de traduction : elle traduit l'intention en interface, l'interface en actions, et les actions en appels système.  
Cette couche de traduction avait du sens à l'époque des opérateurs humains, parce que les humains ont besoin d'une lecture visuelle.

Mais dès que des Fays entrent dans la boucle, l'UI introduit une perte d'information très subtile :

- Ce que les humains peuvent lire est rarement ce que les machines peuvent exprimer le plus précisément.  
- Les structures que les machines exécutent avec exactitude se voient écrasées par l'UI en une seule phrase de langage naturel.  
- Ce qu'il en reste n'est pas une collaboration. C'est une poignée de main verbale.

Dès que la collaboration porte une vraie responsabilité, les poignées de main verbales ne suffisent plus.  
Il faut une structure sémantique auditable.

Telepathy ne consiste donc pas à « supprimer l'UI ». Il s'agit de supprimer la couche de traduction de l'UI.  
Telepathy permet à la communication entre Fays de porter directement le sens et l'intention, au lieu de se renvoyer du texte.

## 2. La faiblesse du dialogue : il laisse la responsabilité s'évaporer dans la sémantique

L'un des plus grands malentendus actuels autour de l'AI consiste à confondre « capacité à converser » et « capacité à rendre des comptes ».  
Avoir l'air humain n'est pas la même chose que porter une responsabilité sociale.

Lorsqu'un coFay prend une décision dans un rôle public, ce que la société a besoin de savoir, c'est :

- Sur quelles règles t'es-tu appuyé ?  
- Quelles données as-tu mobilisées ?  
- Quelles actions as-tu déclenchées ?  
- Quelle était l'étendue de ton autorisation ?  
- Quand quelque chose tourne mal, comment puis-je faire appel, comment passe-t-on en revue, comment attribue-t-on la responsabilité ?

Si tout cela est enfoui dans un journal de conversation, la responsabilité s'évapore dans la sémantique.  
Un journal de conversation peut toujours être réinterprété, reraconté, abrégé. Il ne porte aucune certitude institutionnelle.

Je ne veux pas que les services publics de demain se résument à « se disputer avec l'AI ».  
Je veux qu'ils signifient « tu repars avec une structure de décision vérifiable ».

## 3. La direction de Telepathy : utiliser des tokens (encodages vectoriels) plutôt que du texte pour porter le sens structuré

Le geste central de Telepathy est le suivant :  
laisser des tokens convenus (encodages vectoriels) porter la sémantique, plutôt que s'appuyer sur du texte structuré.

Cela paraît abstrait, mais voyez-y l'écart entre deux époques :

- Avant : les gens s'écrivaient des lettres (langage naturel) et pouvaient coopérer, mais lentement et avec peu de capacité de relecture.  
- Aujourd'hui : nous coopérons via des piles de protocoles (HTTP/TLS/OAuth), où la sémantique est protocolisée et où les frontières de la responsabilité sont fixées.

Telepathy se veut la « pile de protocoles » du monde des Fays.  
Il évite à iFay et coFay de devoir se montrer des UIs, et évite de devoir aplatir le sens en une phrase.  
Ils peuvent échanger directement du sens structuré, et l'efficacité comme la justesse de leur collaboration gagnent un ordre de grandeur.

## 4. L'« efficacité de la collaboration » n'est que la surface. Le vrai cœur, c'est la gouvernabilité

Je ne veux pas que Telepathy soit vendu comme « plus rapide ».  
Un système plus rapide qui ne peut pas être gouverné n'est qu'un système plus dangereux.

La vraie valeur de Telepathy est de rendre la gouvernance possible :

- Une fois la sémantique protocolisée, on peut l'auditer : que signifie réellement cette séquence de tokens ?  
- On peut faire du contrôle d'accès : quels tokens sont autorisés à apparaître sous quelle autorisation ?  
- On peut faire de la revue a posteriori : chaque « échange de sens » le long de la chaîne de collaboration est traçable.  
- On peut faire de l'appel : les litiges cessent d'être « tu m'as mal compris » et deviennent « la structure de protocole était-elle conforme aux règles ? »

C'est la direction sur laquelle je reviens sans cesse : l'AI ne peut être laissée sans surveillance. Elle doit agir sous tutelle humaine.  
Et la tutelle, ce n'est pas seulement la pédale de frein. Cela englobe l'explicabilité, le droit d'appel et la possibilité d'attribuer la responsabilité.

## 5. Telepathy et iFay/coFay : rendre les rôles publics réellement utilisables

Imaginez une scène d'hôpital dans quelques années :

Votre iFay envoie vos symptômes, vos antécédents médicaux, vos préférences en matière de risque et vos limites de confidentialité directement au coFay de l'hôpital, dans la sémantique de Telepathy.  
Le coFay de l'hôpital ne vous oblige pas à tout décrire dix fois et ne perd pas d'information dans un formulaire UI.  
Ce qu'il renvoie n'est pas une « réponse conversationnelle ». C'est une structure de décision auditable : le fondement, les règles, les actions, et un chemin clair pour faire appel.

C'est l'instant où les services publics deviennent vraiment quelque chose que l'AI peut porter.  
Parce que cela ne dépend plus de « la conversation a-t-elle l'air assez humaine ». Cela dépend de « l'institution se comporte-t-elle comme une institution ».

## 6. Pour conclure : mettre fin à l'interface ne chasse pas les humains du système. Cela chasse la couche de traduction

Quand je dis « fin de l'interface », je ne veux pas dire que les humains n'ont plus besoin d'interfaces.  
Les gens auront toujours besoin d'un moyen lisible et contrôlable de voir et d'orienter les choses.  
Ce qu'on chasse du système, c'est cette couche de traduction de l'UI qui ne cesse de perdre la sémantique et de laisser la responsabilité s'évaporer.

L'enjeu de Telepathy, c'est ceci :  
faire passer la collaboration du dialogue à la liaison sémantique directe ;  
laisser les Fays coopérer comme le font les piles de protocoles ;  
faire que les services publics et les rôles sociaux deviennent réellement gouvernables.

Si l'AI doit devenir un membre de la société, cette étape arrivera tôt ou tard.

---

## Documents associés
- Telepathy Protocol (chinois) : https://ifay.ai/zh-CN/docs/Telepathy-Protocol/blueprint/01-%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81TP  
- Telepathy Protocol｜Positionnement central (chinois) : https://ifay.ai/zh-CN/docs/Telepathy-Protocol/blueprint/02-TP%E7%9A%84%E6%A0%B8%E5%BF%83%E5%AE%9A%E4%BD%8D  
- iFay｜Roadmap (EN) : https://ifay.ai/en/docs/iFay/blueprint/04-Roadmap  
