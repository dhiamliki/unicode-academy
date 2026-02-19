INSERT INTO programming_languages (id, code, name) VALUES
                                                       (1, 'c', 'C'),
                                                       (2, 'java', 'Java'),
                                                       (3, 'python', 'Python'),
                                                       (4, 'cpp', 'C++'),
                                                       (5, 'mysql', 'MySQL'),
                                                       (6, 'csharp', 'C# / .NET'),
                                                       (7, 'html', 'HTML'),
                                                       (8, 'css', 'CSS'),
                                                       (9, 'js', 'JavaScript');

INSERT INTO courses (id, code, title, description, language_id) VALUES
                                                                    (1, 'C-101', 'Programmation en C', 'Bases et notions avancÃ©es en C : variables, conditions, boucles, pointeurs, fichiers.', 1),
                                                                    (2, 'JAVA-101', 'Programmation Java', 'Bases et notions avancÃ©es en Java : OOP, exceptions, collections, fichiers.', 2),
                                                                    (3, 'PY-101', 'Programmation Python', 'Bases et notions utiles en Python : structures, fonctions, fichiers, collections.', 3),
                                                                    (4, 'CPP-101', 'Programmation C++', 'Bases et notions avances en C++ : types, OOP, STL, fichiers.', 4),
                                                                    (5, 'MYSQL-101', 'Bases MySQL', 'Requetes SQL, tables, jointures, agregats, transactions.', 5),
                                                                    (6, 'CSHARP-101', '.NET (C#)', 'Syntaxe C#, OOP, collections, LINQ, fichiers.', 6),
                                                                    (7, 'HTML-101', 'HTML', 'Structure de page, elements, formulaires, semantique.', 7),
                                                                    (8, 'CSS-101', 'CSS', 'Mise en page, couleurs, typographie, flexbox, grid.', 8),
                                                                    (9, 'JS-101', 'JavaScript', 'Variables, DOM, events, fetch, async, modules.', 9);

INSERT INTO lessons (id, title, content, order_index, course_id) VALUES
                                                                     (1, 'Variables et types', '## Objectif
Comprendre les types de base en C, declarer et initialiser des variables, puis afficher leurs valeurs.

## Exemple 1
```c
int age = 20;
double note = 15.5;
char lettre = ''A'';
printf("age=%d note=%.1f lettre=%c\n", age, note, lettre);
```

## Exemple 2
```c
double pi = 3.14159;
int entier = (int)pi;
printf("pi=%.2f entier=%d\n", pi, entier);
printf("sizeof(int)=%zu\n", sizeof(int));
```

## Exemple 3
```c
short s = 300;
unsigned int u = 42u;
printf("s=%hd u=%u\n", s, u);
```

## Ã€ retenir
- Types courants: int, double, char, long, float.
- Initialiser les variables evite des valeurs indefinies.
- La conversion explicite se fait avec (type).
', 1, 1),
                                                                     (2, 'OpÃ©rateurs', '## Objectif
Utiliser les operateurs arithmetiques, de comparaison et logiques, et comprendre la precedence.

## Exemple 1
```c
int a=10, b=3;
printf("a+b=%d a*b=%d a%%b=%d\n", a+b, a*b, a%b);
```

## Exemple 2
```c
int x=5, y=7;
int ok = (x < y) && (y <= 10);
printf("x<y=%d ok=%d\n", x < y, ok);
```

## Exemple 3
```c
int n=10;
n += 5;
n *= 2;
printf("%d\n", n);
```

## Ã€ retenir
- Parentheses clarifient la precedence.
- Comparaison: == != < > <= >=.
- Logique: && (et), || (ou), ! (non).
', 2, 1),
                                                                     (3, 'Conditions', '## Objectif
Ecrire des conditions avec if/else, switch et operateur ternaire.

## Exemple 1
```c
int note=12;
if(note>=10) printf("Admis\n");
else printf("AjournÃ©\n");
```

## Exemple 2
```c
int choix = 2;
switch(choix){
  case 1: printf("Ajouter\n"); break;
  case 2: printf("Supprimer\n"); break;
  default: printf("Inconnu\n"); break;
}
```

## Exemple 3
```c
int age=17;
const char* msg = (age>=18) ? "majeur" : "mineur";
printf("%s\n", msg);
```

## Ã€ retenir
- if/else teste une condition booleenne.
- switch choisit selon une valeur, penser a break.
- L operateur ternaire est court: cond ? a : b.
', 3, 1),
                                                                     (4, 'Boucles', '## Objectif
Repeter des actions avec for/while et utiliser break/continue.

## Exemple 1
```c
int sum=0;
for(int i=1;i<=5;i++) sum+=i;
printf("sum=%d\n", sum);
```

## Exemple 2
```c
int x=1;
while(x!=0){
  scanf("%d",&x);
  printf("lu=%d\n", x);
}
```

## Exemple 3
```c
int i=0;
do{
  printf("%d ", i);
  i++;
}while(i<3);
```

## Ã€ retenir
- for convient quand le nombre d iterations est connu.
- while convient quand la condition est testee a chaque tour.
- break sort, continue saute a l iteration suivante.
', 4, 1),
                                                                     (5, 'Fonctions', '## Objectif
Creer des fonctions reutilisables avec parametres et valeur de retour.

## Exemple 1
```c
int add(int a,int b){ return a+b; }
printf("%d\n", add(2,3));
```

## Exemple 2
```c
int max2(int a,int b){ return (a>b)?a:b; }
printf("%d\n", max2(7,4));
```

## Exemple 3
```c
int square(int x){ return x*x; }
printf("%d\n", square(4));
```

## Ã€ retenir
- Une fonction a un type de retour et des parametres.
- Le prototype permet la declaration avant usage.
- Les arguments sont passes par valeur.
', 5, 1),
                                                                     (6, 'PortÃ©e et variables', '## Objectif
Comprendre la portee des variables, static et const.

## Exemple 1
```c
int g=10;
void f(){
  int g=5;
  printf("local=%d\n", g);
}
```

## Exemple 2
```c
void counter(){
  static int c=0;
  c++;
  printf("c=%d\n", c);
}
```

## Exemple 3
```c
const int max=3;
for(int i=0;i<max;i++){
  printf("%d\n", i);
}
```

## Ã€ retenir
- Une variable locale est visible dans son bloc.
- static conserve la valeur entre appels.
- const protege une variable contre la modification.
', 6, 1),
                                                                     (7, 'Tableaux', '## Objectif
Manipuler un tableau, acceder aux elements et parcourir avec une boucle.

## Exemple 1
```c
int t[3]={1,2,3};
printf("%d\n", t[0]);
```

## Exemple 2
```c
int t[5]={2,4,6,8,10};
int sum=0;
for(int i=0;i<5;i++) sum+=t[i];
printf("moy=%.2f\n", sum/5.0);
```

## Exemple 3
```c
int t[4];
for(int i=0;i<4;i++) t[i]=i+1;
printf("%d\n", t[3]);
```

## Ã€ retenir
- Les indices commencent a 0.
- La taille est fixe a la creation.
- sizeof(t)/sizeof(t[0]) donne le nombre d elements.
', 7, 1),
                                                                     (8, 'ChaÃ®nes', '## Objectif
Comprendre qu une chaine est un tableau de char termine par \0.

## Exemple 1
```c
char s[]="Hello";
printf("%s %zu\n", s, strlen(s));
```

## Exemple 2
```c
char a[20]="Bonjour";
char b[20]="C";
strcat(a," ");
strcat(a,b);
printf("%s\n", a);
```

## Exemple 3
```c
char a[]="abc";
char b[]="abd";
printf("%d\n", strcmp(a,b));
```

## Ã€ retenir
- Une chaine se termine par le caractere nul \0.
- Utiliser string.h pour strlen, strcpy, strcmp, strcat.
- Toujours prevoir assez de place pour \0.
', 8, 1),
                                                                     (9, 'EntrÃ©es / Sorties', '## Objectif
Lire et afficher des donnees avec scanf/printf et fgets.

## Exemple 1
```c
int x; double y;
scanf("%d %lf", &x, &y);
printf("x=%d y=%.2f\n", x, y);
```

## Exemple 2
```c
char buf[50];
fgets(buf, sizeof(buf), stdin);
printf("ligne=%s", buf);
```

## Exemple 3
```c
char name[20];
scanf("%19s", name);
printf("bonjour %s\n", name);
```

## Ã€ retenir
- scanf lit selon un format, passer l adresse avec &.
- fgets lit une ligne complete et evite le depassement.
- printf formate la sortie.
', 9, 1),
                                                                     (10, 'Pointeurs', '## Objectif
Comprendre les pointeurs, les adresses et le dereferencement.

## Exemple 1
```c
int x=10;
int *p=&x;
*p=20;
printf("x=%d\n", x);
```

## Exemple 2
```c
int y=5;
int *p=&y;
printf("adresse=%p valeur=%d\n", (void*)p, *p);
```

## Exemple 3
```c
int t[3]={1,2,3};
int *p=&t[1];
printf("%d\n", *p);
```

## Ã€ retenir
- & donne l adresse, * donne la valeur pointee.
- Un pointeur non initialise est dangereux.
- Le type du pointeur indique le type pointe.
', 10, 1),
                                                                     (11, 'Pointeurs & tableaux', '## Objectif
Relier t[i] et l arithmetique de pointeurs.

## Exemple 1
```c
int t[3]={10,20,30};
int *p=t;
printf("%d %d\n", *p, *(p+1));
```

## Exemple 2
```c
int sum(int *t,int n){
  int s=0;
  for(int i=0;i<n;i++) s+=t[i];
  return s;
}
```

## Exemple 3
```c
int t[4]={1,2,3,4};
for(int *p=t; p<t+4; p++) printf("%d ", *p);
```

## Ã€ retenir
- Un tableau passe en parametre devient un pointeur.
- *(t+i) est equivalent a t[i].
- L arithmetique avance par taille de type.
', 11, 1),
                                                                     (12, 'Allocation dynamique', '## Objectif
Allouer et liberer de la memoire avec malloc/free.

## Exemple 1
```c
int n=5;
int *t = malloc(n*sizeof(int));
for(int i=0;i<n;i++) t[i]=i*i;
free(t);
```

## Exemple 2
```c
int *t = malloc(2*sizeof(int));
t = realloc(t, 4*sizeof(int));
free(t);
```

## Exemple 3
```c
int *t = calloc(3, sizeof(int));
printf("%d\n", t[0]);
free(t);
```

## Ã€ retenir
- Toujours verifier si malloc retourne NULL.
- realloc peut deplacer le bloc.
- free libere la memoire une seule fois.
', 12, 1),
                                                                     (13, 'Structures', '## Objectif
Regrouper des champs avec struct et acceder aux champs.

## Exemple 1
```c
struct Student { int id; char name[20]; };
struct Student s = {1, "Sara"};
printf("%d %s\n", s.id, s.name);
```

## Exemple 2
```c
struct Point { int x; int y; };
struct Point p = {2,3};
struct Point *pp = &p;
printf("%d %d\n", pp->x, pp->y);
```

## Exemple 3
```c
struct Point { int x; int y; };
struct Point pts[2] = { {1,2}, {3,4} };
printf("%d\n", pts[1].x);
```

## Ã€ retenir
- Utiliser . pour un objet, -> pour un pointeur.
- Une struct regroupe plusieurs variables.
- On peut creer des tableaux de struct.
', 13, 1),
                                                                     (14, 'typedef & enum', '## Objectif
Creer des alias de type et des constantes enumerees.

## Exemple 1
```c
typedef unsigned int uint;
uint n = 10;
```

## Exemple 2
```c
enum Level { EASY, MEDIUM, HARD };
enum Level l = MEDIUM;
```

## Exemple 3
```c
enum Level l = HARD;
switch(l){
  case EASY: printf("easy\n"); break;
  case MEDIUM: printf("medium\n"); break;
  case HARD: printf("hard\n"); break;
}
```

## Ã€ retenir
- typedef simplifie les types longs.
- enum liste des valeurs constantes.
- Les enums peuvent etre utilises dans switch.
', 14, 1),
                                                                     (15, 'Fichiers', '## Objectif
Lire et ecrire dans un fichier texte.

## Exemple 1
```c
FILE *f = fopen("out.txt","w");
fprintf(f,"Hello\n");
fclose(f);
```

## Exemple 2
```c
FILE *f = fopen("out.txt","r");
char line[100];
while(fgets(line, sizeof(line), f)) printf("%s", line);
fclose(f);
```

## Exemple 3
```c
FILE *f = fopen("out.txt","a");
fprintf(f,"Ajout\n");
fclose(f);
```

## Ã€ retenir
- Verifier f!=NULL apres fopen.
- fclose est obligatoire.
- fgets lit une ligne entiere.
', 15, 1),
                                                                     (16, 'RÃ©cursivitÃ©', '## Objectif
Ecrire une fonction recursive avec un cas d arret.

## Exemple 1
```c
int fact(int n){ return (n<=1)?1:n*fact(n-1); }
```

## Exemple 2
```c
int fib(int n){ return (n<=1)?n:fib(n-1)+fib(n-2); }
```

## Exemple 3
```c
int sum(int n){ return (n==0)?0:n+sum(n-1); }
```

## Ã€ retenir
- Toujours definir un cas d arret.
- Chaque appel ajoute une frame sur la pile.
- La recursion peut etre couteuse.
', 16, 1),
                                                                     (17, 'PrÃ©processeur', '## Objectif
Utiliser le preprocesseur pour des constantes et macros.

## Exemple 1
```c
#define PI 3.14159
double a = PI * 2;
```

## Exemple 2
```c
#define SQR(x) ((x)*(x))
int r = SQR(5);
```

## Exemple 3
```c
#define DEBUG 1
#if DEBUG
printf("debug\n");
#endif
```

## Ã€ retenir
- Le preprocesseur agit avant compilation.
- Une macro doit etre parenthesee.
- #include ajoute un fichier header.
', 17, 1),
                                                                     (18, 'Pointeurs sur fonctions', '## Objectif
Appeler une fonction via son adresse et passer une fonction en parametre.

## Exemple 1
```c
int add(int a,int b){return a+b;}
int (*pf)(int,int)=add;
printf("%d\n", pf(2,3));
```

## Exemple 2
```c
int apply(int (*op)(int,int), int a, int b){
  return op(a,b);
}
```

## Exemple 3
```c
int add(int a,int b){ return a+b; }
int sub(int a,int b){ return a-b; }
int (*ops[2])(int,int) = { add, sub };
printf("%d\n", ops[1](5,2));
```

## Ã€ retenir
- La syntaxe du pointeur de fonction contient (*pf).
- On peut passer une fonction comme argument.
- Utile pour des callbacks.
', 18, 1),
                                                                     (19, 'Gestion d''erreurs', '## Objectif
Verifier les retours de fonctions et gerer les erreurs.

## Exemple 1
```c
FILE *f = fopen("x.txt","r");
if(!f){ perror("fopen"); return 1; }
```

## Exemple 2
```c
int *p = malloc(10*sizeof(int));
if(!p){ fprintf(stderr,"malloc failed\n"); return 1; }
```

## Exemple 3
```c
int n;
if(scanf("%d",&n)!=1){ fprintf(stderr,"bad input\n"); }
```

## Ã€ retenir
- Toujours tester les valeurs de retour.
- perror affiche un message base sur errno.
- En cas d erreur, retourner un code non nul.
', 19, 1),
                                                                     (20, 'Quiz final C', '## Objectif
Reviser les notions principales du C.

Quiz final (15 questions).', 20, 1);


INSERT INTO lessons (id, title, content, order_index, course_id) VALUES
                                                                     (21, 'Variables et types', '## Objectif
Declarer des variables Java et distinguer types primitifs et String.

## Exemple 1
```java
int x=5;
double y=2.5;
String s="Hi";
System.out.println(x+" "+y+" "+s);
```

## Exemple 2
```java
int a=3;
double b=4.2;
double c = a + b;
System.out.println(c);
```

## Exemple 3
```java
double d=9.8;
int i=(int)d;
System.out.println(i);
```

## Ã€ retenir
- Primitifs: int, double, boolean, char.
- String est un objet.
- Initialiser les variables evite des erreurs.
', 1, 2),
                                                                     (22, 'OpÃ©rateurs', '## Objectif
Utiliser les operateurs arithmetiques, de comparaison et logiques.

## Exemple 1
```java
int a=10, b=3;
System.out.println(a+b);
System.out.println(a%b);
```

## Exemple 2
```java
String s1="abc", s2="abc";
System.out.println(s1.equals(s2));
System.out.println(a > b && b >= 0);
```

## Exemple 3
```java
int n=7;
String res = (n%2==0) ? "pair" : "impair";
System.out.println(res);
```

## Ã€ retenir
- Utiliser equals pour comparer des String.
- Comparaison: == != < > <= >=.
- Logique: &&, ||, !.
', 2, 2),
                                                                     (23, 'Conditions', '## Objectif
Ecrire des conditions avec if/else et switch.

## Exemple 1
```java
int note=12;
if(note>=10) System.out.println("Admis");
else System.out.println("AjournÃ©");
```

## Exemple 2
```java
int choix=2;
switch(choix){
  case 1: System.out.println("Ajouter"); break;
  case 2: System.out.println("Supprimer"); break;
  default: System.out.println("Inconnu");
}
```

## Exemple 3
```java
String role="admin";
if("admin".equals(role)) System.out.println("ok");
else System.out.println("no");
```

## Ã€ retenir
- if/else teste une condition booleenne.
- switch choisit selon une valeur, penser a break.
- Les blocs utilisent des accolades.
', 3, 2),
                                                                     (24, 'Boucles', '## Objectif
Utiliser for et while pour repeter des actions.

## Exemple 1
```java
int sum=0;
for(int i=1;i<=5;i++) sum+=i;
System.out.println(sum);
```

## Exemple 2
```java
int n=3;
while(n>0){
  System.out.println(n);
  n--;
}
```

## Exemple 3
```java
int i=0;
do{
  System.out.println(i);
  i++;
}while(i<3);
```

## Ã€ retenir
- for convient quand le nombre d iterations est connu.
- while convient quand la condition est testee a chaque tour.
- break et continue controlent la boucle.
', 4, 2),
                                                                     (25, 'MÃ©thodes', '## Objectif
Creer des methodes statiques et surcharger.

## Exemple 1
```java
static int add(int a,int b){ return a+b; }
```

## Exemple 2
```java
static int add(int a,int b,int c){ return a+b+c; }
```

## Exemple 3
```java
static void print(String s){ System.out.println(s); }
static void print(int n){ System.out.println(n); }
```

## Ã€ retenir
- La signature inclut nom et types des parametres.
- Une methode peut etre surchargee.
- Le type de retour peut etre void.
', 5, 2),
                                                                     (26, 'Classes et objets', '## Objectif
Comprendre classe et objet, et instancier avec new.

## Exemple 1
```java
class User{
  String name;
  void hello(){ System.out.println("Hi "+name); }
}
User u = new User();
u.name="Lina";
u.hello();
```

## Exemple 2
```java
User u1 = new User();
User u2 = new User();
u1.name="Ana";
u2.name="Ben";
```

## Exemple 3
```java
User u = new User();
u.name = "Ali";
u.name = u.name.toUpperCase();
System.out.println(u.name);
```

## Ã€ retenir
- Une classe est un modele.
- Un objet est une instance.
- Les champs et methodes appartiennent a la classe.
', 6, 2),
                                                                     (27, 'Constructeurs', '## Objectif
Initialiser un objet avec un constructeur.

## Exemple 1
```java
class User{
  String name;
  User(String name){ this.name=name; }
}
User u = new User("Sara");
```

## Exemple 2
```java
class Point{
  int x; int y;
  Point(){ this(0,0); }
  Point(int x,int y){ this.x=x; this.y=y; }
}
```

## Exemple 3
```java
class User{
  String name;
  User(){ this("Guest"); }
  User(String name){ this.name=name; }
}
```

## Ã€ retenir
- Le constructeur a le meme nom que la classe.
- Il ne declare pas de type de retour.
- On peut surcharger les constructeurs.
', 7, 2),
                                                                     (28, 'Encapsulation', '## Objectif
Proteger les champs avec private et exposer des getters/setters.

## Exemple 1
```java
class User{
  private String email;
  public String getEmail(){ return email; }
  public void setEmail(String email){ this.email=email; }
}
```

## Exemple 2
```java
public void setAge(int age){
  if(age>=0) this.age=age;
}
```

## Exemple 3
```java
public boolean isAdult(){
  return age>=18;
}
```

## Ã€ retenir
- private cache les donnees internes.
- Les setters peuvent valider les valeurs.
- L encapsulation protege les invariants.
', 8, 2),
                                                                     (29, 'HÃ©ritage', '## Objectif
Reutiliser du code avec extends et override.

## Exemple 1
```java
class Person{ String name; }
class Student extends Person{ int level; }
```

## Exemple 2
```java
class Animal{
  void speak(){ System.out.println("..."); }
}
class Dog extends Animal{
  @Override void speak(){ System.out.println("Woof"); }
}
```

## Exemple 3
```java
class Person{
  String name;
  Person(String n){ this.name=n; }
}
class Student extends Person{
  Student(String n){ super(n); }
}
```

## Ã€ retenir
- extends cree une relation parent/enfant.
- @Override indique une redefinition.
- super permet d appeler le parent.
', 9, 2),
                                                                     (30, 'Polymorphisme', '## Objectif
Utiliser le polymorphisme avec une reference de type parent.

## Exemple 1
```java
Animal a = new Dog();
a.speak();
```

## Exemple 2
```java
Animal[] animals = { new Dog(), new Cat() };
for(Animal x: animals) x.speak();
```

## Exemple 3
```java
List<Animal> list = List.of(new Dog(), new Cat());
for(Animal x: list) x.speak();
```

## Ã€ retenir
- Une reference parent peut pointer un enfant.
- La methode appelee depend de l objet reel.
- Favoriser les types abstraits.
', 10, 2),
                                                                     (31, 'Interfaces', '## Objectif
Definir un contrat avec interface.

## Exemple 1
```java
interface Drawable{ void draw(); }
class Circle implements Drawable{
  public void draw(){ System.out.println("draw"); }
}
```

## Exemple 2
```java
interface Loggable{ void log(); }
class User implements Drawable, Loggable{
  public void draw(){ }
  public void log(){ }
}
```

## Exemple 3
```java
interface Printable{ void print(); }
Printable p = () -> System.out.println("Hi");
p.print();
```

## Ã€ retenir
- Une classe peut implementer plusieurs interfaces.
- Les methodes d interface sont publiques.
- Les interfaces aident le test et le decouplage.
', 11, 2),
                                                                     (32, 'Exceptions', '## Objectif
Gerer les erreurs avec try/catch et throw.

## Exemple 1
```java
try{
  int n = Integer.parseInt("a");
}catch(NumberFormatException e){
  System.out.println("Erreur");
}
```

## Exemple 2
```java
if(x<0){
  throw new IllegalArgumentException("x negatif");
}
```

## Exemple 3
```java
try{
  System.out.println("work");
} finally {
  System.out.println("fin");
}
```

## Ã€ retenir
- try/catch intercepte les exceptions.
- throw lance une exception.
- Certaines exceptions sont checked.
', 12, 2),
                                                                     (33, 'Collections - List', '## Objectif
Manipuler une List avec ArrayList.

## Exemple 1
```java
List<String> names = new ArrayList<>();
names.add("Ana");
names.add("Ben");
System.out.println(names.get(0));
```

## Exemple 2
```java
for(String n: names){
  System.out.println(n);
}
```

## Exemple 3
```java
names.remove(0);
System.out.println(names.size());
```

## Ã€ retenir
- List garde l ordre et accepte les doublons.
- L indice commence a 0.
- ArrayList est une implementation courante.
', 13, 2),
                                                                     (34, 'Collections - Map', '## Objectif
Utiliser une Map pour associer cle et valeur.

## Exemple 1
```java
Map<String,Integer> m = new HashMap<>();
m.put("a",1);
m.put("b",2);
System.out.println(m.get("a"));
```

## Exemple 2
```java
for(Map.Entry<String,Integer> e: m.entrySet()){
  System.out.println(e.getKey()+":"+e.getValue());
}
```

## Exemple 3
```java
int v = m.getOrDefault("z", 0);
System.out.println(v);
```

## Ã€ retenir
- Les cles sont uniques.
- get retourne null si absent.
- HashMap est rapide pour les acces.
', 14, 2),
                                                                     (35, 'GÃ©nÃ©riques', '## Objectif
Utiliser les generiques pour securiser les types.

## Exemple 1
```java
List<Integer> nums = new ArrayList<>();
nums.add(10);
```

## Exemple 2
```java
static <T> T first(List<T> list){
  return list.get(0);
}
```

## Exemple 3
```java
class Box<T>{
  T value;
  Box(T v){ value=v; }
}
Box<String> b = new Box<>("hi");
```

## Ã€ retenir
- Les generiques evitent les casts.
- Le type est verifie a la compilation.
- On peut definir des methodes generiques.
', 15, 2),
                                                                     (36, 'Fichiers', '## Objectif
Lire et ecrire des fichiers avec java.nio.

## Exemple 1
```java
Path p = Path.of("a.txt");
List<String> lines = Files.readAllLines(p);
```

## Exemple 2
```java
Files.writeString(Path.of("out.txt"), "Hello\n");
```

## Exemple 3
```java
try (BufferedReader br = Files.newBufferedReader(Path.of("a.txt"))) {
  System.out.println(br.readLine());
}
```

## Ã€ retenir
- Les operations peuvent lever IOException.
- Path represente un chemin.
- Files fournit des methodes utilitaires.
', 16, 2),
                                                                     (37, 'Dates (java.time)', '## Objectif
Manipuler les dates avec java.time.

## Exemple 1
```java
LocalDate d = LocalDate.now();
System.out.println(d.plusDays(7));
```

## Exemple 2
```java
LocalDateTime dt = LocalDateTime.now();
DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
System.out.println(dt.format(f));
```

## Exemple 3
```java
LocalDate d = LocalDate.parse("2026-02-16");
System.out.println(d.getDayOfWeek());
```

## Ã€ retenir
- Les objets java.time sont immuables.
- Utiliser DateTimeFormatter pour le format.
- LocalDate ne contient pas heure.
', 17, 2),
                                                                     (38, 'Streams (intro)', '## Objectif
Decouvrir les streams pour traiter des collections.

## Exemple 1
```java
List<Integer> nums = List.of(1,2,3,4);
List<Integer> even = nums.stream()
  .filter(n -> n%2==0)
  .toList();
```

## Exemple 2
```java
int sum = nums.stream()
  .mapToInt(n -> n)
  .sum();
```

## Exemple 3
```java
List<String> names = List.of("ana","ben");
List<String> upper = names.stream().map(String::toUpperCase).toList();
```

## Ã€ retenir
- Les operations intermediaires sont lazy.
- Une operation terminale declenche le calcul.
- Les streams rendent le code expressif.
', 18, 2),
                                                                     (39, 'Mini-projet : ToDo', '## Objectif
Construire un mini gestionnaire de taches.

## Exemple 1
```java
class Task{
  String title;
  boolean done;
}
```

## Exemple 2
```java
List<Task> tasks = new ArrayList<>();
Task t = new Task();
t.title="Lire";
tasks.add(t);
```

## Exemple 3
```java
tasks.get(0).done = true;
```

## Ã€ retenir
- Stocker les taches dans une List.
- Ajouter, supprimer, marquer comme fait.
- Afficher une liste claire.
', 19, 2),
                                                                     (40, 'Quiz final Java', '## Objectif
Reviser les notions principales de Java.

Quiz final (15 questions).', 20, 2);


INSERT INTO lessons (id, title, content, order_index, course_id) VALUES
                                                                     (41, 'Variables et types', '## Objectif
Affecter des valeurs et connaitre les types de base.

## Exemple 1
```python
x = 5
pi = 3.14
name = "Sara"
print(x, pi, name)
```

## Exemple 2
```python
y = "10"
n = int(y)
print(type(n), n)
```

## Exemple 3
```python
a, b = 1, 2
print(a + b)
```

## Ã€ retenir
- Python est a typage dynamique.
- int, float, str, bool sont courants.
- type(x) permet de verifier.
', 1, 3),
                                                                     (42, 'OpÃ©rateurs', '## Objectif
Utiliser les operateurs arithmetiques et logiques.

## Exemple 1
```python
a = 7
b = 2
print(a + b, a // b, a % b)
```

## Exemple 2
```python
x = 5
y = 7
print(x < y and y <= 10)
```

## Exemple 3
```python
a = 1
b = -1
ok = (a > 0) or (b < 0)
print(ok)
```

## Ã€ retenir
- `**` est la puissance, `//` la division entiere.
- Comparaison: == != < > <= >=.
- Logique: and, or, not.
', 2, 3),
                                                                     (43, 'Conditions', '## Objectif
Ecrire des conditions avec if/elif/else.

## Exemple 1
```python
note = 12
if note >= 10:
    print("Admis")
else:
    print("AjournÃ©")
```

## Exemple 2
```python
x = -1
if x > 0:
    print("positif")
elif x == 0:
    print("zero")
else:
    print("negatif")
```

## Exemple 3
```python
x = 5
status = "ok" if x > 0 else "ko"
print(status)
```

## Ã€ retenir
- L indentation definit les blocs.
- elif permet des cas multiples.
- Les conditions utilisent des booleens.
', 3, 3),
                                                                     (44, 'Boucles', '## Objectif
Utiliser for et while pour repeter.

## Exemple 1
```python
s = 0
for i in range(1, 6):
    s += i
print(s)
```

## Exemple 2
```python
n = 3
while n > 0:
    print(n)
    n -= 1
```

## Exemple 3
```python
for i, v in enumerate(["a", "b", "c"]):
    print(i, v)
```

## Ã€ retenir
- range(5) donne 0..4.
- break arrete la boucle, continue saute un tour.
- while depend dune condition.
', 4, 3),
                                                                     (45, 'Fonctions', '## Objectif
Definir des fonctions avec def et return.

## Exemple 1
```python
def add(a, b):
    return a + b
print(add(2, 3))
```

## Exemple 2
```python
def greet(name="User"):
    print("Hi", name)
greet()
greet("Sara")
```

## Exemple 3
```python
def sum_all(*nums):
    return sum(nums)
print(sum_all(1, 2, 3))
```

## Ã€ retenir
- Une fonction sans return renvoie None.
- Les parametres peuvent avoir une valeur par defaut.
- Les arguments peuvent etre nommes.
', 5, 3),
                                                                     (46, 'Listes', '## Objectif
Manipuler des listes et leurs methodes.

## Exemple 1
```python
nums = [1, 2, 3]
nums.append(4)
print(nums)
```

## Exemple 2
```python
names = ["Ana", "Ben", "Cara"]
print(names[0], names[-1])
print(names[1:3])
```

## Exemple 3
```python
nums = [1, 2, 3, 4]
evens = [x for x in nums if x % 2 == 0]
print(evens)
```

## Ã€ retenir
- Les listes sont mutables.
- Les indices commencent a 0.
- Le slicing cree une sous-liste.
', 6, 3),
                                                                     (47, 'Tuples', '## Objectif
Utiliser les tuples pour des donnees fixes.

## Exemple 1
```python
t = (1, 2, 3)
a, b, c = t
print(a, b, c)
```

## Exemple 2
```python
single = (5,)
print(type(single))
```

## Exemple 3
```python
def divmod2(a, b):
    return a // b, a % b
q, r = divmod2(7, 3)
print(q, r)
```

## Ã€ retenir
- Un tuple est immuable.
- Une virgule cree un tuple a un element.
- Le unpacking est pratique.
', 7, 3),
                                                                     (48, 'Dictionnaires', '## Objectif
Associer des cles et valeurs avec un dictionnaire.

## Exemple 1
```python
user = {"name": "Ana", "age": 20}
print(user["name"])
```

## Exemple 2
```python
scores = {"a": 1, "b": 2}
for k, v in scores.items():
    print(k, v)
```

## Exemple 3
```python
d = {x: x*x for x in range(3)}
print(d)
```

## Ã€ retenir
- Les cles sont uniques.
- get permet une valeur par defaut.
- items() renvoie des paires.
', 8, 3),
                                                                     (49, 'Sets', '## Objectif
Utiliser les sets pour eliminer les doublons.

## Exemple 1
```python
s = {1, 2, 2, 3}
print(s)
```

## Exemple 2
```python
a = {1, 2, 3}
b = {3, 4}
print(a | b)
print(a & b)
```

## Exemple 3
```python
s = set()
s.add(1)
s.add(2)
s.remove(1)
print(s)
```

## Ã€ retenir
- Un set ne garde pas les doublons.
- Union: | , intersection: &.
- Un set est non ordonne.
', 9, 3),
                                                                     (50, 'ChaÃ®nes', '## Objectif
Manipuler les chaines et leurs methodes.

## Exemple 1
```python
s = "Hello"
print(s.upper(), s.lower())
print(s[1:4])
```

## Exemple 2
```python
name = "Sara"
age = 20
print(f"{name} a {age} ans")
```

## Exemple 3
```python
words = "a b c".split()
print("-".join(words))
```

## Ã€ retenir
- Les chaines sont immuables.
- Le slicing fonctionne comme sur les listes.
- f-strings simplifient le format.
', 10, 3),
                                                                     (51, 'EntrÃ©es / Sorties', '## Objectif
Lire des donnees utilisateur et afficher des resultats.

## Exemple 1
```python
x = int(input("x="))
y = int(input("y="))
print(x + y)
```

## Exemple 2
```python
name = input("Nom: ")
print("Bonjour", name)
```

## Exemple 3
```python
x = 2
y = 3
print(f"{x} + {y} = {x+y}")
```

## Ã€ retenir
- input() renvoie une chaine.
- Convertir avec int() ou float().
- print() accepte plusieurs arguments.
', 11, 3),
                                                                     (52, 'Fichiers', '## Objectif
Lire et ecrire des fichiers texte.

## Exemple 1
```python
with open("out.txt", "w") as f:
    f.write("Hello\n")
```

## Exemple 2
```python
with open("out.txt", "r") as f:
    data = f.read()
print(data)
```

## Exemple 3
```python
with open("out.txt", "a") as f:
    f.write("more\n")
```

## Ã€ retenir
- with ferme le fichier automatiquement.
- read() lit tout, readlines() lit par lignes.
- Le mode "w" ecrase le fichier.
', 12, 3),
                                                                     (53, 'Exceptions', '## Objectif
Gerer les erreurs avec try/except/finally.

## Exemple 1
```python
try:
    n = int("a")
except ValueError:
    print("Erreur")
```

## Exemple 2
```python
try:
    x = 10 / 0
except ZeroDivisionError:
    print("Division par zero")
finally:
    print("fin")
```

## Exemple 3
```python
x = -1
if x < 0:
    raise ValueError("negatif")
```

## Ã€ retenir
- Attraper des exceptions precises.
- finally est toujours execute.
- Les erreurs ne doivent pas planter le programme.
', 13, 3),
                                                                     (54, 'Modules', '## Objectif
Importer et utiliser des modules standards.

## Exemple 1
```python
import math
print(math.sqrt(9))
```

## Exemple 2
```python
from random import randint
print(randint(1, 6))
```

## Exemple 3
```python
import datetime as dt
print(dt.date.today())
```

## Ã€ retenir
- import charge un module.
- from ... import ... importe des elements.
- help(module) donne de la documentation.
', 14, 3),
                                                                     (55, 'ComprÃ©hensions', '## Objectif
Ecrire des comprehensions pour creer des listes et dict.

## Exemple 1
```python
squares = [x*x for x in range(5)]
print(squares)
```

## Exemple 2
```python
d = {x: x*x for x in range(3)}
print(d)
```

## Exemple 3
```python
s = {x*x for x in range(5)}
print(s)
```

## Ã€ retenir
- Les comprehensions sont concises.
- Garder la lisibilite.
- Elles remplacent souvent une boucle simple.
', 15, 3),
                                                                     (56, 'Lambda', '## Objectif
Utiliser lambda pour de petites fonctions.

## Exemple 1
```python
items = [("a", 3), ("b", 1)]
items.sort(key=lambda x: x[1])
print(items)
```

## Exemple 2
```python
nums = [1, 2, 3]
doubled = list(map(lambda x: x*2, nums))
print(doubled)
```

## Exemple 3
```python
nums = [1, 2, 3, 4]
evens = list(filter(lambda x: x%2==0, nums))
print(evens)
```

## Ã€ retenir
- lambda cree une fonction anonyme courte.
- Utilisee avec map, filter, sorted.
- Pour du code long, preferer def.
', 16, 3),
                                                                     (57, 'OOP (classes)', '## Objectif
Creer des classes et objets en Python.

## Exemple 1
```python
class User:
    def __init__(self, name):
        self.name = name
    def hello(self):
        print("Hi", self.name)

u = User("Sara")
u.hello()
```

## Exemple 2
```python
class Admin(User):
    def hello(self):
        print("Admin", self.name)
```

## Exemple 3
```python
class Counter:
    def __init__(self):
        self.n = 0
    def inc(self):
        self.n += 1

c = Counter()
c.inc()
print(c.n)
```

## Ã€ retenir
- self reference l objet courant.
- __init__ initialise les attributs.
- Une classe peut heriter dune autre.
', 17, 3),
                                                                     (58, 'Packages (pip)', '## Objectif
Installer et utiliser des packages avec pip.

## Exemple 1
```bash
pip install requests
```

## Exemple 2
```python
import requests
r = requests.get("https://example.com")
print(r.status_code)
```

## Exemple 3
```bash
pip freeze > requirements.txt
```

## Ã€ retenir
- Utiliser un environnement virtuel.
- pip installe les dependances.
- requirements.txt liste les packages.
', 18, 3),
                                                                     (59, 'Mini-projet : analyse texte', '## Objectif
Compter des mots et analyser un texte.

## Exemple 1
```python
text = "bonjour bonjour monde"
words = text.split()
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1
print(counts)
```

## Exemple 2
```python
text = "abcaba"
freq = {}
for ch in text:
    freq[ch] = freq.get(ch, 0) + 1
print(freq)
```

## Exemple 3
```python
counts = {"a": 3, "b": 1, "c": 2}
top = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:3]
print(top)
```

## Ã€ retenir
- split() decoupe en mots.
- dict est ideal pour compter.
- Normaliser en minuscules aide.
', 19, 3),
                                                                     (60, 'Quiz final Python', '## Objectif
Reviser les notions principales de Python.

Quiz final (15 questions).', 20, 3);


INSERT INTO lessons (id, title, content, order_index, course_id) VALUES
                                                                     (61, 'Variables et types', '## Objectif
Comprendre Variables et types en C++.

## Exemple 1
~~~cpp
int a = 5; double b = 2.5;
~~~

## Exemple 2
~~~cpp
auto x = 10;
~~~

## Exemple 3
~~~cpp
// Variables et types
std::cout << "ok";
~~~

## A retenir
- Sujet: Variables et types.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 1, 4),
                                                                     (62, 'Entree / Sortie', '## Objectif
Comprendre Entree / Sortie en C++.

## Exemple 1
~~~cpp
int n; std::cin >> n;
~~~

## Exemple 2
~~~cpp
std::cout << n;
~~~

## Exemple 3
~~~cpp
// Entree / Sortie
std::cout << "ok";
~~~

## A retenir
- Sujet: Entree / Sortie.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 2, 4),
                                                                     (63, 'Operateurs', '## Objectif
Comprendre Operateurs en C++.

## Exemple 1
~~~cpp
int c = a + b;
~~~

## Exemple 2
~~~cpp
bool ok = (a > b);
~~~

## Exemple 3
~~~cpp
// Operateurs
std::cout << "ok";
~~~

## A retenir
- Sujet: Operateurs.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 3, 4),
                                                                     (64, 'Conditions', '## Objectif
Comprendre Conditions en C++.

## Exemple 1
~~~cpp
if(n>0){ std::cout << "ok"; }
~~~

## Exemple 2
~~~cpp
switch(day){ case 1: break; }
~~~

## Exemple 3
~~~cpp
// Conditions
std::cout << "ok";
~~~

## A retenir
- Sujet: Conditions.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 4, 4),
                                                                     (65, 'Boucles', '## Objectif
Comprendre Boucles en C++.

## Exemple 1
~~~cpp
for(int i=0;i<5;i++){}
~~~

## Exemple 2
~~~cpp
while(i<3){ i++; }
~~~

## Exemple 3
~~~cpp
// Boucles
std::cout << "ok";
~~~

## A retenir
- Sujet: Boucles.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 5, 4),
                                                                     (66, 'Fonctions', '## Objectif
Comprendre Fonctions en C++.

## Exemple 1
~~~cpp
int add(int a,int b){ return a+b; }
~~~

## Exemple 2
~~~cpp
int inc(int x=0){ return x+1; }
~~~

## Exemple 3
~~~cpp
// Fonctions
std::cout << "ok";
~~~

## A retenir
- Sujet: Fonctions.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 6, 4),
                                                                     (67, 'References et pointeurs', '## Objectif
Comprendre References et pointeurs en C++.

## Exemple 1
~~~cpp
int& r = x;
~~~

## Exemple 2
~~~cpp
int* p = &x;
~~~

## Exemple 3
~~~cpp
// References et pointeurs
std::cout << "ok";
~~~

## A retenir
- Sujet: References et pointeurs.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 7, 4),
                                                                     (68, 'Tableaux et vector', '## Objectif
Comprendre Tableaux et vector en C++.

## Exemple 1
~~~cpp
int t[3] = {1,2,3};
~~~

## Exemple 2
~~~cpp
std::vector<int> v; v.push_back(1);
~~~

## Exemple 3
~~~cpp
// Tableaux et vector
std::cout << "ok";
~~~

## A retenir
- Sujet: Tableaux et vector.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 8, 4),
                                                                     (69, 'Strings', '## Objectif
Comprendre Strings en C++.

## Exemple 1
~~~cpp
std::string s = "hi";
~~~

## Exemple 2
~~~cpp
s += " world";
~~~

## Exemple 3
~~~cpp
// Strings
std::cout << "ok";
~~~

## A retenir
- Sujet: Strings.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 9, 4),
                                                                     (70, 'Structs et classes', '## Objectif
Comprendre Structs et classes en C++.

## Exemple 1
~~~cpp
struct P{int x;};
~~~

## Exemple 2
~~~cpp
class U{ public: void hi(){} };
~~~

## Exemple 3
~~~cpp
// Structs et classes
std::cout << "ok";
~~~

## A retenir
- Sujet: Structs et classes.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 10, 4),
                                                                     (71, 'Constructeurs', '## Objectif
Comprendre Constructeurs en C++.

## Exemple 1
~~~cpp
class U{ public: U(){} };
~~~

## Exemple 2
~~~cpp
class U{ public: U(int a){} };
~~~

## Exemple 3
~~~cpp
// Constructeurs
std::cout << "ok";
~~~

## A retenir
- Sujet: Constructeurs.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 11, 4),
                                                                     (72, 'Encapsulation', '## Objectif
Comprendre Encapsulation en C++.

## Exemple 1
~~~cpp
class U{ private: int age; public: void setAge(int a){ age=a; } };
~~~

## Exemple 2
~~~cpp
int getAge() const { return age; }
~~~

## Exemple 3
~~~cpp
// Encapsulation
std::cout << "ok";
~~~

## A retenir
- Sujet: Encapsulation.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 12, 4),
                                                                     (73, 'Heritage', '## Objectif
Comprendre Heritage en C++.

## Exemple 1
~~~cpp
class A{}; class B: public A{};
~~~

## Exemple 2
~~~cpp
B b;
~~~

## Exemple 3
~~~cpp
// Heritage
std::cout << "ok";
~~~

## A retenir
- Sujet: Heritage.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 13, 4),
                                                                     (74, 'Polymorphisme', '## Objectif
Comprendre Polymorphisme en C++.

## Exemple 1
~~~cpp
virtual void f();
~~~

## Exemple 2
~~~cpp
A* p = new B();
~~~

## Exemple 3
~~~cpp
// Polymorphisme
std::cout << "ok";
~~~

## A retenir
- Sujet: Polymorphisme.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 14, 4),
                                                                     (75, 'Templates', '## Objectif
Comprendre Templates en C++.

## Exemple 1
~~~cpp
template<typename T> T maxT(T a,T b){ return a>b?a:b; }
~~~

## Exemple 2
~~~cpp
std::vector<int> v;
~~~

## Exemple 3
~~~cpp
// Templates
std::cout << "ok";
~~~

## A retenir
- Sujet: Templates.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 15, 4),
                                                                     (76, 'STL algorithmes', '## Objectif
Comprendre STL algorithmes en C++.

## Exemple 1
~~~cpp
std::sort(v.begin(), v.end());
~~~

## Exemple 2
~~~cpp
auto it = std::find(v.begin(), v.end(), 3);
~~~

## Exemple 3
~~~cpp
// STL algorithmes
std::cout << "ok";
~~~

## A retenir
- Sujet: STL algorithmes.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 16, 4),
                                                                     (77, 'Fichiers', '## Objectif
Comprendre Fichiers en C++.

## Exemple 1
~~~cpp
std::ofstream f("out.txt");
~~~

## Exemple 2
~~~cpp
std::ifstream f("out.txt");
~~~

## Exemple 3
~~~cpp
// Fichiers
std::cout << "ok";
~~~

## A retenir
- Sujet: Fichiers.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 17, 4),
                                                                     (78, 'Memoire', '## Objectif
Comprendre Memoire en C++.

## Exemple 1
~~~cpp
int* p = new int(5);
~~~

## Exemple 2
~~~cpp
delete p;
~~~

## Exemple 3
~~~cpp
// Memoire
std::cout << "ok";
~~~

## A retenir
- Sujet: Memoire.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 18, 4),
                                                                     (79, 'Exceptions', '## Objectif
Comprendre Exceptions en C++.

## Exemple 1
~~~cpp
try { throw std::runtime_error("err"); } catch(...){}
~~~

## Exemple 2
~~~cpp
throw std::invalid_argument("x");
~~~

## Exemple 3
~~~cpp
// Exceptions
std::cout << "ok";
~~~

## A retenir
- Sujet: Exceptions.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 19, 4),
                                                                     (80, 'Quiz final C++', '## Objectif
Comprendre Quiz final C++ en C++.

Quiz final (15 questions).', 20, 4);

INSERT INTO lessons (id, title, content, order_index, course_id) VALUES
                                                                     (81, 'Introduction MySQL', '## Objectif
Comprendre Introduction MySQL en MySQL.

## Exemple 1
~~~sql
SHOW DATABASES;
~~~

## Exemple 2
~~~sql
SELECT VERSION();
~~~

## Exemple 3
~~~sql
-- Introduction MySQL
SELECT 1;
~~~

## A retenir
- Sujet: Introduction MySQL.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 1, 5),
                                                                     (82, 'Creer base et table', '## Objectif
Comprendre Creer base et table en MySQL.

## Exemple 1
~~~sql
CREATE DATABASE shop;
~~~

## Exemple 2
~~~sql
CREATE TABLE users(id INT PRIMARY KEY);
~~~

## Exemple 3
~~~sql
-- Creer base et table
SELECT 1;
~~~

## A retenir
- Sujet: Creer base et table.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 2, 5),
                                                                     (83, 'Inserer des donnees', '## Objectif
Comprendre Inserer des donnees en MySQL.

## Exemple 1
~~~sql
INSERT INTO users(id) VALUES (1);
~~~

## Exemple 2
~~~sql
INSERT INTO users(id) VALUES (2),(3);
~~~

## Exemple 3
~~~sql
-- Inserer des donnees
SELECT 1;
~~~

## A retenir
- Sujet: Inserer des donnees.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 3, 5),
                                                                     (84, 'SELECT basics', '## Objectif
Comprendre SELECT basics en MySQL.

## Exemple 1
~~~sql
SELECT * FROM users;
~~~

## Exemple 2
~~~sql
SELECT id FROM users;
~~~

## Exemple 3
~~~sql
-- SELECT basics
SELECT 1;
~~~

## A retenir
- Sujet: SELECT basics.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 4, 5),
                                                                     (85, 'WHERE', '## Objectif
Comprendre WHERE en MySQL.

## Exemple 1
~~~sql
SELECT * FROM users WHERE id=1;
~~~

## Exemple 2
~~~sql
SELECT * FROM users WHERE name LIKE "A%";
~~~

## Exemple 3
~~~sql
-- WHERE
SELECT 1;
~~~

## A retenir
- Sujet: WHERE.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 5, 5),
                                                                     (86, 'ORDER BY et LIMIT', '## Objectif
Comprendre ORDER BY et LIMIT en MySQL.

## Exemple 1
~~~sql
SELECT * FROM users ORDER BY id DESC;
~~~

## Exemple 2
~~~sql
SELECT * FROM users LIMIT 5;
~~~

## Exemple 3
~~~sql
-- ORDER BY et LIMIT
SELECT 1;
~~~

## A retenir
- Sujet: ORDER BY et LIMIT.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 6, 5),
                                                                     (87, 'Fonctions agregat', '## Objectif
Comprendre Fonctions agregat en MySQL.

## Exemple 1
~~~sql
SELECT COUNT(*) FROM users;
~~~

## Exemple 2
~~~sql
SELECT AVG(score) FROM users;
~~~

## Exemple 3
~~~sql
-- Fonctions agregat
SELECT 1;
~~~

## A retenir
- Sujet: Fonctions agregat.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 7, 5),
                                                                     (88, 'GROUP BY et HAVING', '## Objectif
Comprendre GROUP BY et HAVING en MySQL.

## Exemple 1
~~~sql
SELECT city, COUNT(*) FROM users GROUP BY city;
~~~

## Exemple 2
~~~sql
SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*)>1;
~~~

## Exemple 3
~~~sql
-- GROUP BY et HAVING
SELECT 1;
~~~

## A retenir
- Sujet: GROUP BY et HAVING.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 8, 5),
                                                                     (89, 'JOIN INNER', '## Objectif
Comprendre JOIN INNER en MySQL.

## Exemple 1
~~~sql
SELECT * FROM A INNER JOIN B ON A.id=B.a_id;
~~~

## Exemple 2
~~~sql
SELECT u.name,o.total FROM users u JOIN orders o ON u.id=o.user_id;
~~~

## Exemple 3
~~~sql
-- JOIN INNER
SELECT 1;
~~~

## A retenir
- Sujet: JOIN INNER.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 9, 5),
                                                                     (90, 'JOIN LEFT', '## Objectif
Comprendre JOIN LEFT en MySQL.

## Exemple 1
~~~sql
SELECT * FROM A LEFT JOIN B ON A.id=B.a_id;
~~~

## Exemple 2
~~~sql
SELECT u.name,o.total FROM users u LEFT JOIN orders o ON u.id=o.user_id;
~~~

## Exemple 3
~~~sql
-- JOIN LEFT
SELECT 1;
~~~

## A retenir
- Sujet: JOIN LEFT.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 10, 5),
                                                                     (91, 'Sous-requetes', '## Objectif
Comprendre Sous-requetes en MySQL.

## Exemple 1
~~~sql
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
~~~

## Exemple 2
~~~sql
SELECT * FROM users WHERE score > (SELECT AVG(score) FROM users);
~~~

## Exemple 3
~~~sql
-- Sous-requetes
SELECT 1;
~~~

## A retenir
- Sujet: Sous-requetes.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 11, 5),
                                                                     (92, 'UPDATE', '## Objectif
Comprendre UPDATE en MySQL.

## Exemple 1
~~~sql
UPDATE users SET name="Ana" WHERE id=1;
~~~

## Exemple 2
~~~sql
UPDATE users SET score=score+1;
~~~

## Exemple 3
~~~sql
-- UPDATE
SELECT 1;
~~~

## A retenir
- Sujet: UPDATE.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 12, 5),
                                                                     (93, 'DELETE', '## Objectif
Comprendre DELETE en MySQL.

## Exemple 1
~~~sql
DELETE FROM users WHERE id=1;
~~~

## Exemple 2
~~~sql
TRUNCATE TABLE logs;
~~~

## Exemple 3
~~~sql
-- DELETE
SELECT 1;
~~~

## A retenir
- Sujet: DELETE.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 13, 5),
                                                                     (94, 'Indexes', '## Objectif
Comprendre Indexes en MySQL.

## Exemple 1
~~~sql
CREATE INDEX idx_name ON users(name);
~~~

## Exemple 2
~~~sql
EXPLAIN SELECT * FROM users WHERE name="Ana";
~~~

## Exemple 3
~~~sql
-- Indexes
SELECT 1;
~~~

## A retenir
- Sujet: Indexes.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 14, 5),
                                                                     (95, 'Contraintes', '## Objectif
Comprendre Contraintes en MySQL.

## Exemple 1
~~~sql
CREATE TABLE t(id INT PRIMARY KEY, email VARCHAR(50) UNIQUE);
~~~

## Exemple 2
~~~sql
ALTER TABLE orders ADD FOREIGN KEY(user_id) REFERENCES users(id);
~~~

## Exemple 3
~~~sql
-- Contraintes
SELECT 1;
~~~

## A retenir
- Sujet: Contraintes.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 15, 5),
                                                                     (96, 'Transactions', '## Objectif
Comprendre Transactions en MySQL.

## Exemple 1
~~~sql
START TRANSACTION;
~~~

## Exemple 2
~~~sql
COMMIT;
~~~

## Exemple 3
~~~sql
-- Transactions
SELECT 1;
~~~

## A retenir
- Sujet: Transactions.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 16, 5),
                                                                     (97, 'Vues', '## Objectif
Comprendre Vues en MySQL.

## Exemple 1
~~~sql
CREATE VIEW v AS SELECT * FROM users;
~~~

## Exemple 2
~~~sql
SELECT * FROM v;
~~~

## Exemple 3
~~~sql
-- Vues
SELECT 1;
~~~

## A retenir
- Sujet: Vues.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 17, 5),
                                                                     (98, 'Procedures stockees', '## Objectif
Comprendre Procedures stockees en MySQL.

## Exemple 1
~~~sql
DELIMITER // CREATE PROCEDURE p() BEGIN SELECT 1; END //
~~~

## Exemple 2
~~~sql
CALL p();
~~~

## Exemple 3
~~~sql
-- Procedures stockees
SELECT 1;
~~~

## A retenir
- Sujet: Procedures stockees.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 18, 5),
                                                                     (99, 'Fonctions', '## Objectif
Comprendre Fonctions en MySQL.

## Exemple 1
~~~sql
DELIMITER // CREATE FUNCTION f(a INT) RETURNS INT RETURN a+1; //
~~~

## Exemple 2
~~~sql
SELECT f(1);
~~~

## Exemple 3
~~~sql
-- Fonctions
SELECT 1;
~~~

## A retenir
- Sujet: Fonctions.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 19, 5),
                                                                     (100, 'Quiz final MySQL', '## Objectif
Comprendre Quiz final MySQL en MySQL.

Quiz final (15 questions).', 20, 5);

INSERT INTO lessons (id, title, content, order_index, course_id) VALUES
                                                                     (101, 'Variables et types', '## Objectif
Comprendre Variables et types en C#.

## Exemple 1
~~~csharp
int x=5; double y=2.5;
~~~

## Exemple 2
~~~csharp
var name="Ana";
~~~

## Exemple 3
~~~csharp
// Variables et types
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Variables et types.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 1, 6),
                                                                     (102, 'Entree / Sortie', '## Objectif
Comprendre Entree / Sortie en C#.

## Exemple 1
~~~csharp
string s = Console.ReadLine();
~~~

## Exemple 2
~~~csharp
Console.WriteLine(s);
~~~

## Exemple 3
~~~csharp
// Entree / Sortie
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Entree / Sortie.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 2, 6),
                                                                     (103, 'Operateurs', '## Objectif
Comprendre Operateurs en C#.

## Exemple 1
~~~csharp
int c = a + b;
~~~

## Exemple 2
~~~csharp
bool ok = a > b;
~~~

## Exemple 3
~~~csharp
// Operateurs
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Operateurs.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 3, 6),
                                                                     (104, 'Conditions', '## Objectif
Comprendre Conditions en C#.

## Exemple 1
~~~csharp
if(n>0){ Console.WriteLine("ok"); }
~~~

## Exemple 2
~~~csharp
switch(day){ case 1: break; }
~~~

## Exemple 3
~~~csharp
// Conditions
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Conditions.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 4, 6),
                                                                     (105, 'Boucles', '## Objectif
Comprendre Boucles en C#.

## Exemple 1
~~~csharp
for(int i=0;i<5;i++){}
~~~

## Exemple 2
~~~csharp
foreach(var v in list){}
~~~

## Exemple 3
~~~csharp
// Boucles
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Boucles.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 5, 6),
                                                                     (106, 'Methodes', '## Objectif
Comprendre Methodes en C#.

## Exemple 1
~~~csharp
static int Add(int a,int b){ return a+b; }
~~~

## Exemple 2
~~~csharp
static int Inc(int x=0){ return x+1; }
~~~

## Exemple 3
~~~csharp
// Methodes
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Methodes.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 6, 6),
                                                                     (107, 'Classes et objets', '## Objectif
Comprendre Classes et objets en C#.

## Exemple 1
~~~csharp
class User{ public string Name; }
~~~

## Exemple 2
~~~csharp
var u = new User();
~~~

## Exemple 3
~~~csharp
// Classes et objets
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Classes et objets.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 7, 6),
                                                                     (108, 'Constructeurs', '## Objectif
Comprendre Constructeurs en C#.

## Exemple 1
~~~csharp
class User{ public User(){} }
~~~

## Exemple 2
~~~csharp
class User{ public User(string n){} }
~~~

## Exemple 3
~~~csharp
// Constructeurs
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Constructeurs.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 8, 6),
                                                                     (109, 'Proprietes', '## Objectif
Comprendre Proprietes en C#.

## Exemple 1
~~~csharp
public int Age { get; set; }
~~~

## Exemple 2
~~~csharp
public string Name { get; private set; }
~~~

## Exemple 3
~~~csharp
// Proprietes
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Proprietes.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 9, 6),
                                                                     (110, 'Heritage', '## Objectif
Comprendre Heritage en C#.

## Exemple 1
~~~csharp
class B : A { }
~~~

## Exemple 2
~~~csharp
var b = new B();
~~~

## Exemple 3
~~~csharp
// Heritage
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Heritage.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 10, 6),
                                                                     (111, 'Interfaces', '## Objectif
Comprendre Interfaces en C#.

## Exemple 1
~~~csharp
interface IPrintable{ void Print(); }
~~~

## Exemple 2
~~~csharp
class Doc : IPrintable { public void Print(){} }
~~~

## Exemple 3
~~~csharp
// Interfaces
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Interfaces.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 11, 6),
                                                                     (112, 'Collections', '## Objectif
Comprendre Collections en C#.

## Exemple 1
~~~csharp
var list = new List<int>();
~~~

## Exemple 2
~~~csharp
var map = new Dictionary<string,int>();
~~~

## Exemple 3
~~~csharp
// Collections
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Collections.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 12, 6),
                                                                     (113, 'LINQ', '## Objectif
Comprendre LINQ en C#.

## Exemple 1
~~~csharp
var evens = nums.Where(n => n%2==0);
~~~

## Exemple 2
~~~csharp
var sum = nums.Sum();
~~~

## Exemple 3
~~~csharp
// LINQ
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: LINQ.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 13, 6),
                                                                     (114, 'Exceptions', '## Objectif
Comprendre Exceptions en C#.

## Exemple 1
~~~csharp
try { } catch(Exception) { }
~~~

## Exemple 2
~~~csharp
throw new Exception("err");
~~~

## Exemple 3
~~~csharp
// Exceptions
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Exceptions.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 14, 6),
                                                                     (115, 'Fichiers', '## Objectif
Comprendre Fichiers en C#.

## Exemple 1
~~~csharp
File.WriteAllText("out.txt","Hi");
~~~

## Exemple 2
~~~csharp
string s = File.ReadAllText("out.txt");
~~~

## Exemple 3
~~~csharp
// Fichiers
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Fichiers.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 15, 6),
                                                                     (116, 'Async / Await', '## Objectif
Comprendre Async / Await en C#.

## Exemple 1
~~~csharp
async Task Wait(){ await Task.Delay(1000); }
~~~

## Exemple 2
~~~csharp
await Wait();
~~~

## Exemple 3
~~~csharp
// Async / Await
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Async / Await.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 16, 6),
                                                                     (117, 'Nullable', '## Objectif
Comprendre Nullable en C#.

## Exemple 1
~~~csharp
int? n = null;
~~~

## Exemple 2
~~~csharp
int v = n ?? 0;
~~~

## Exemple 3
~~~csharp
// Nullable
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Nullable.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 17, 6),
                                                                     (118, 'Enums et structs', '## Objectif
Comprendre Enums et structs en C#.

## Exemple 1
~~~csharp
enum Level { Low, High }
~~~

## Exemple 2
~~~csharp
struct Point { public int X; }
~~~

## Exemple 3
~~~csharp
// Enums et structs
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Enums et structs.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 18, 6),
                                                                     (119, 'Delegates et events', '## Objectif
Comprendre Delegates et events en C#.

## Exemple 1
~~~csharp
Func<int,int> f = x => x+1;
~~~

## Exemple 2
~~~csharp
event Action OnDone;
~~~

## Exemple 3
~~~csharp
// Delegates et events
Console.WriteLine("ok");
~~~

## A retenir
- Sujet: Delegates et events.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 19, 6),
                                                                     (120, 'Quiz final C#', '## Objectif
Comprendre Quiz final C# en C#.

Quiz final (15 questions).', 20, 6);

INSERT INTO lessons (id, title, content, order_index, course_id) VALUES
                                                                     (121, 'Structure de page', '## Objectif
Comprendre Structure de page en HTML.

## Exemple 1
~~~html
<!DOCTYPE html>
<html><head></head><body></body></html>
~~~

## Exemple 2
~~~html
<head><title>Page</title></head>
~~~

## Exemple 3
~~~html
<!-- Structure de page -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Structure de page.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 1, 7),
                                                                     (122, 'Texte et titres', '## Objectif
Comprendre Texte et titres en HTML.

## Exemple 1
~~~html
<h1>Titre</h1>
~~~

## Exemple 2
~~~html
<p>Texte</p>
~~~

## Exemple 3
~~~html
<!-- Texte et titres -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Texte et titres.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 2, 7),
                                                                     (123, 'Liens', '## Objectif
Comprendre Liens en HTML.

## Exemple 1
~~~html
<a href="/home">Accueil</a>
~~~

## Exemple 2
~~~html
<a href="https://example.com">Site</a>
~~~

## Exemple 3
~~~html
<!-- Liens -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Liens.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 3, 7),
                                                                     (124, 'Images', '## Objectif
Comprendre Images en HTML.

## Exemple 1
~~~html
<img src="img.png" alt="img" />
~~~

## Exemple 2
~~~html
<figure><img src="a.png" alt="a" /><figcaption>Texte</figcaption></figure>
~~~

## Exemple 3
~~~html
<!-- Images -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Images.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 4, 7),
                                                                     (125, 'Listes', '## Objectif
Comprendre Listes en HTML.

## Exemple 1
~~~html
<ul><li>Un</li></ul>
~~~

## Exemple 2
~~~html
<ol><li>Deux</li></ol>
~~~

## Exemple 3
~~~html
<!-- Listes -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Listes.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 5, 7),
                                                                     (126, 'Tableaux', '## Objectif
Comprendre Tableaux en HTML.

## Exemple 1
~~~html
<table><tr><th>Nom</th></tr></table>
~~~

## Exemple 2
~~~html
<table><tr><td>Ana</td></tr></table>
~~~

## Exemple 3
~~~html
<!-- Tableaux -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Tableaux.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 6, 7),
                                                                     (127, 'Formulaires', '## Objectif
Comprendre Formulaires en HTML.

## Exemple 1
~~~html
<form><input type="text" /></form>
~~~

## Exemple 2
~~~html
<form><button type="submit">Envoyer</button></form>
~~~

## Exemple 3
~~~html
<!-- Formulaires -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Formulaires.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 7, 7),
                                                                     (128, 'Types de champs', '## Objectif
Comprendre Types de champs en HTML.

## Exemple 1
~~~html
<input type="email" />
~~~

## Exemple 2
~~~html
<input type="password" />
~~~

## Exemple 3
~~~html
<!-- Types de champs -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Types de champs.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 8, 7),
                                                                     (129, 'Elements semantiques', '## Objectif
Comprendre Elements semantiques en HTML.

## Exemple 1
~~~html
<header>Top</header>
~~~

## Exemple 2
~~~html
<main><article>Article</article></main>
~~~

## Exemple 3
~~~html
<!-- Elements semantiques -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Elements semantiques.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 9, 7),
                                                                     (130, 'Media', '## Objectif
Comprendre Media en HTML.

## Exemple 1
~~~html
<audio controls src="a.mp3"></audio>
~~~

## Exemple 2
~~~html
<video controls src="v.mp4"></video>
~~~

## Exemple 3
~~~html
<!-- Media -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Media.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 10, 7),
                                                                     (131, 'Div et sections', '## Objectif
Comprendre Div et sections en HTML.

## Exemple 1
~~~html
<div class="box">Bloc</div>
~~~

## Exemple 2
~~~html
<section><h2>Section</h2></section>
~~~

## Exemple 3
~~~html
<!-- Div et sections -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Div et sections.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 11, 7),
                                                                     (132, 'Meta tags', '## Objectif
Comprendre Meta tags en HTML.

## Exemple 1
~~~html
<meta charset="utf-8" />
~~~

## Exemple 2
~~~html
<meta name="viewport" content="width=device-width, initial-scale=1" />
~~~

## Exemple 3
~~~html
<!-- Meta tags -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Meta tags.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 12, 7),
                                                                     (133, 'Accessibilite', '## Objectif
Comprendre Accessibilite en HTML.

## Exemple 1
~~~html
<img src="a.png" alt="logo" />
~~~

## Exemple 2
~~~html
<label for="email">Email</label><input id="email" />
~~~

## Exemple 3
~~~html
<!-- Accessibilite -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Accessibilite.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 13, 7),
                                                                     (134, 'Attributs data', '## Objectif
Comprendre Attributs data en HTML.

## Exemple 1
~~~html
<div data-id="42"></div>
~~~

## Exemple 2
~~~html
<button data-action="save">Save</button>
~~~

## Exemple 3
~~~html
<!-- Attributs data -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Attributs data.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 14, 7),
                                                                     (135, 'Iframes et embed', '## Objectif
Comprendre Iframes et embed en HTML.

## Exemple 1
~~~html
<iframe src="https://example.com"></iframe>
~~~

## Exemple 2
~~~html
<embed src="file.pdf" />
~~~

## Exemple 3
~~~html
<!-- Iframes et embed -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Iframes et embed.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 15, 7),
                                                                     (136, 'Validation', '## Objectif
Comprendre Validation en HTML.

## Exemple 1
~~~html
<input required />
~~~

## Exemple 2
~~~html
<input minlength="3" />
~~~

## Exemple 3
~~~html
<!-- Validation -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Validation.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 16, 7),
                                                                     (137, 'SEO de base', '## Objectif
Comprendre SEO de base en HTML.

## Exemple 1
~~~html
<title>Ma page</title>
~~~

## Exemple 2
~~~html
<meta name="description" content="Page" />
~~~

## Exemple 3
~~~html
<!-- SEO de base -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: SEO de base.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 17, 7),
                                                                     (138, 'Inline vs block', '## Objectif
Comprendre Inline vs block en HTML.

## Exemple 1
~~~html
<span>Inline</span>
~~~

## Exemple 2
~~~html
<div>Block</div>
~~~

## Exemple 3
~~~html
<!-- Inline vs block -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Inline vs block.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 18, 7),
                                                                     (139, 'Details et resume', '## Objectif
Comprendre Details et resume en HTML.

## Exemple 1
~~~html
<details><summary>Plus</summary>Texte</details>
~~~

## Exemple 2
~~~html
<details open><summary>Ouvert</summary>Texte</details>
~~~

## Exemple 3
~~~html
<!-- Details et resume -->
<div>Exemple</div>
~~~

## A retenir
- Sujet: Details et resume.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 19, 7),
                                                                     (140, 'Quiz final HTML', '## Objectif
Comprendre Quiz final HTML en HTML.

Quiz final (15 questions).', 20, 7);

INSERT INTO lessons (id, title, content, order_index, course_id) VALUES
                                                                     (141, 'Selecteurs', '## Objectif
Comprendre Selecteurs en CSS.

## Exemple 1
~~~css
h1 { color: red; }
~~~

## Exemple 2
~~~css
.card { padding: 10px; }
~~~

## Exemple 3
~~~css
/* Selecteurs */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Selecteurs.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 1, 8),
                                                                     (142, 'Box model', '## Objectif
Comprendre Box model en CSS.

## Exemple 1
~~~css
.box { margin: 10px; padding: 20px; }
~~~

## Exemple 2
~~~css
.box { border: 1px solid #000; }
~~~

## Exemple 3
~~~css
/* Box model */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Box model.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 2, 8),
                                                                     (143, 'Couleurs et unites', '## Objectif
Comprendre Couleurs et unites en CSS.

## Exemple 1
~~~css
p { color: #333; }
~~~

## Exemple 2
~~~css
div { width: 50%; }
~~~

## Exemple 3
~~~css
/* Couleurs et unites */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Couleurs et unites.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 3, 8),
                                                                     (144, 'Typographie', '## Objectif
Comprendre Typographie en CSS.

## Exemple 1
~~~css
body { font-family: Arial; }
~~~

## Exemple 2
~~~css
p { line-height: 1.6; }
~~~

## Exemple 3
~~~css
/* Typographie */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Typographie.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 4, 8),
                                                                     (145, 'Flexbox', '## Objectif
Comprendre Flexbox en CSS.

## Exemple 1
~~~css
.row { display:flex; }
~~~

## Exemple 2
~~~css
.row { justify-content: space-between; }
~~~

## Exemple 3
~~~css
/* Flexbox */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Flexbox.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 5, 8),
                                                                     (146, 'Grid', '## Objectif
Comprendre Grid en CSS.

## Exemple 1
~~~css
.grid { display:grid; grid-template-columns: 1fr 1fr; }
~~~

## Exemple 2
~~~css
.grid { gap: 10px; }
~~~

## Exemple 3
~~~css
/* Grid */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Grid.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 6, 8),
                                                                     (147, 'Positionnement', '## Objectif
Comprendre Positionnement en CSS.

## Exemple 1
~~~css
.box { position: relative; }
~~~

## Exemple 2
~~~css
.child { position: absolute; top:0; }
~~~

## Exemple 3
~~~css
/* Positionnement */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Positionnement.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 7, 8),
                                                                     (148, 'Display et visibilite', '## Objectif
Comprendre Display et visibilite en CSS.

## Exemple 1
~~~css
.hide { display:none; }
~~~

## Exemple 2
~~~css
.invisible { visibility:hidden; }
~~~

## Exemple 3
~~~css
/* Display et visibilite */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Display et visibilite.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 8, 8),
                                                                     (149, 'Backgrounds', '## Objectif
Comprendre Backgrounds en CSS.

## Exemple 1
~~~css
.box { background:#eee; }
~~~

## Exemple 2
~~~css
.box { background-image:url(bg.png); }
~~~

## Exemple 3
~~~css
/* Backgrounds */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Backgrounds.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 9, 8),
                                                                     (150, 'Bordures et ombres', '## Objectif
Comprendre Bordures et ombres en CSS.

## Exemple 1
~~~css
.box { border-radius: 8px; }
~~~

## Exemple 2
~~~css
.box { box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
~~~

## Exemple 3
~~~css
/* Bordures et ombres */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Bordures et ombres.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 10, 8),
                                                                     (151, 'Transitions', '## Objectif
Comprendre Transitions en CSS.

## Exemple 1
~~~css
.btn { transition: all 0.2s; }
~~~

## Exemple 2
~~~css
.btn:hover { transform: scale(1.05); }
~~~

## Exemple 3
~~~css
/* Transitions */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Transitions.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 11, 8),
                                                                     (152, 'Transforms', '## Objectif
Comprendre Transforms en CSS.

## Exemple 1
~~~css
.box { transform: rotate(5deg); }
~~~

## Exemple 2
~~~css
.box { transform: translateX(10px); }
~~~

## Exemple 3
~~~css
/* Transforms */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Transforms.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 12, 8),
                                                                     (153, 'Responsive', '## Objectif
Comprendre Responsive en CSS.

## Exemple 1
~~~css
@media (max-width:600px){ .grid{ grid-template-columns:1fr; } }
~~~

## Exemple 2
~~~css
@media (min-width:900px){ .grid{ grid-template-columns:1fr 1fr 1fr; } }
~~~

## Exemple 3
~~~css
/* Responsive */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Responsive.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 13, 8),
                                                                     (154, 'Pseudo-classes', '## Objectif
Comprendre Pseudo-classes en CSS.

## Exemple 1
~~~css
a:hover { color:red; }
~~~

## Exemple 2
~~~css
li:nth-child(2){ font-weight:bold; }
~~~

## Exemple 3
~~~css
/* Pseudo-classes */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Pseudo-classes.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 14, 8),
                                                                     (155, 'Pseudo-elements', '## Objectif
Comprendre Pseudo-elements en CSS.

## Exemple 1
~~~css
.tag::before { content:"#"; }
~~~

## Exemple 2
~~~css
.tag::after { content:"!"; }
~~~

## Exemple 3
~~~css
/* Pseudo-elements */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Pseudo-elements.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 15, 8),
                                                                     (156, 'Variables CSS', '## Objectif
Comprendre Variables CSS en CSS.

## Exemple 1
~~~css
:root { --primary:#3366ff; }
~~~

## Exemple 2
~~~css
.btn { color: var(--primary); }
~~~

## Exemple 3
~~~css
/* Variables CSS */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Variables CSS.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 16, 8),
                                                                     (157, 'Animations', '## Objectif
Comprendre Animations en CSS.

## Exemple 1
~~~css
@keyframes fade { from{opacity:0;} to{opacity:1;} }
~~~

## Exemple 2
~~~css
.box { animation: fade 1s; }
~~~

## Exemple 3
~~~css
/* Animations */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Animations.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 17, 8),
                                                                     (158, 'Z-index', '## Objectif
Comprendre Z-index en CSS.

## Exemple 1
~~~css
.front { position: relative; z-index: 10; }
~~~

## Exemple 2
~~~css
.modal { position: fixed; z-index: 1000; }
~~~

## Exemple 3
~~~css
/* Z-index */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Z-index.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 18, 8),
                                                                     (159, 'Overflow', '## Objectif
Comprendre Overflow en CSS.

## Exemple 1
~~~css
.box { overflow: hidden; }
~~~

## Exemple 2
~~~css
.box { overflow: auto; }
~~~

## Exemple 3
~~~css
/* Overflow */
.box { border: 1px solid #000; }
~~~

## A retenir
- Sujet: Overflow.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 19, 8),
                                                                     (160, 'Specificite', '## Objectif
Comprendre Specificite en CSS.

Quiz final (15 questions).', 20, 8);

INSERT INTO lessons (id, title, content, order_index, course_id) VALUES
                                                                     (161, 'Variables', '## Objectif
Comprendre Variables en JavaScript.

## Exemple 1
~~~js
let x = 5;
~~~

## Exemple 2
~~~js
const name = "Ana";
~~~

## Exemple 3
~~~js
// Variables
console.log("ok");
~~~

## A retenir
- Sujet: Variables.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 1, 9),
                                                                     (162, 'Types', '## Objectif
Comprendre Types en JavaScript.

## Exemple 1
~~~js
typeof 3;
~~~

## Exemple 2
~~~js
typeof "hi";
~~~

## Exemple 3
~~~js
// Types
console.log("ok");
~~~

## A retenir
- Sujet: Types.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 2, 9),
                                                                     (163, 'Operateurs', '## Objectif
Comprendre Operateurs en JavaScript.

## Exemple 1
~~~js
7 + 3;
~~~

## Exemple 2
~~~js
5 > 3 && 3 > 0;
~~~

## Exemple 3
~~~js
// Operateurs
console.log("ok");
~~~

## A retenir
- Sujet: Operateurs.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 3, 9),
                                                                     (164, 'Conditions', '## Objectif
Comprendre Conditions en JavaScript.

## Exemple 1
~~~js
if(n>0){ }
~~~

## Exemple 2
~~~js
const res = n%2===0 ? "pair" : "impair";
~~~

## Exemple 3
~~~js
// Conditions
console.log("ok");
~~~

## A retenir
- Sujet: Conditions.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 4, 9),
                                                                     (165, 'Boucles', '## Objectif
Comprendre Boucles en JavaScript.

## Exemple 1
~~~js
for(let i=0;i<5;i++){}
~~~

## Exemple 2
~~~js
for(const v of [1,2]){}
~~~

## Exemple 3
~~~js
// Boucles
console.log("ok");
~~~

## A retenir
- Sujet: Boucles.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 5, 9),
                                                                     (166, 'Fonctions', '## Objectif
Comprendre Fonctions en JavaScript.

## Exemple 1
~~~js
function add(a,b){ return a+b; }
~~~

## Exemple 2
~~~js
const add = (a,b)=>a+b;
~~~

## Exemple 3
~~~js
// Fonctions
console.log("ok");
~~~

## A retenir
- Sujet: Fonctions.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 6, 9),
                                                                     (167, 'Tableaux', '## Objectif
Comprendre Tableaux en JavaScript.

## Exemple 1
~~~js
const t=[1,2,3]; t.push(4);
~~~

## Exemple 2
~~~js
t.reduce((a,b)=>a+b,0);
~~~

## Exemple 3
~~~js
// Tableaux
console.log("ok");
~~~

## A retenir
- Sujet: Tableaux.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 7, 9),
                                                                     (168, 'Objets', '## Objectif
Comprendre Objets en JavaScript.

## Exemple 1
~~~js
const user={name:"Ana"};
~~~

## Exemple 2
~~~js
user.age=20;
~~~

## Exemple 3
~~~js
// Objets
console.log("ok");
~~~

## A retenir
- Sujet: Objets.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 8, 9),
                                                                     (169, 'DOM selection', '## Objectif
Comprendre DOM selection en JavaScript.

## Exemple 1
~~~js
document.querySelector("h1");
~~~

## Exemple 2
~~~js
document.getElementById("main");
~~~

## Exemple 3
~~~js
// DOM selection
console.log("ok");
~~~

## A retenir
- Sujet: DOM selection.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 9, 9),
                                                                     (170, 'Events', '## Objectif
Comprendre Events en JavaScript.

## Exemple 1
~~~js
btn.addEventListener("click", ()=>{});
~~~

## Exemple 2
~~~js
input.addEventListener("input", e=>{});
~~~

## Exemple 3
~~~js
// Events
console.log("ok");
~~~

## A retenir
- Sujet: Events.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 10, 9),
                                                                     (171, 'Fetch API', '## Objectif
Comprendre Fetch API en JavaScript.

## Exemple 1
~~~js
fetch("/api").then(r=>r.json());
~~~

## Exemple 2
~~~js
fetch("/api", { method:"POST" });
~~~

## Exemple 3
~~~js
// Fetch API
console.log("ok");
~~~

## A retenir
- Sujet: Fetch API.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 11, 9),
                                                                     (172, 'Promises et async', '## Objectif
Comprendre Promises et async en JavaScript.

## Exemple 1
~~~js
const p = new Promise(res=>res(1));
~~~

## Exemple 2
~~~js
async function f(){ const r = await p; }
~~~

## Exemple 3
~~~js
// Promises et async
console.log("ok");
~~~

## A retenir
- Sujet: Promises et async.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 12, 9),
                                                                     (173, 'Modules', '## Objectif
Comprendre Modules en JavaScript.

## Exemple 1
~~~js
export function add(a,b){ return a+b; }
~~~

## Exemple 2
~~~js
import { add } from "./math.js";
~~~

## Exemple 3
~~~js
// Modules
console.log("ok");
~~~

## A retenir
- Sujet: Modules.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 13, 9),
                                                                     (174, 'Erreurs', '## Objectif
Comprendre Erreurs en JavaScript.

## Exemple 1
~~~js
try { JSON.parse("{"); } catch(e){}
~~~

## Exemple 2
~~~js
throw new Error("err");
~~~

## Exemple 3
~~~js
// Erreurs
console.log("ok");
~~~

## A retenir
- Sujet: Erreurs.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 14, 9),
                                                                     (175, 'LocalStorage', '## Objectif
Comprendre LocalStorage en JavaScript.

## Exemple 1
~~~js
localStorage.setItem("token","abc");
~~~

## Exemple 2
~~~js
localStorage.getItem("token");
~~~

## Exemple 3
~~~js
// LocalStorage
console.log("ok");
~~~

## A retenir
- Sujet: LocalStorage.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 15, 9),
                                                                     (176, 'Destructuring', '## Objectif
Comprendre Destructuring en JavaScript.

## Exemple 1
~~~js
const [a,b]=[1,2];
~~~

## Exemple 2
~~~js
const {name} = {name:"Ana"};
~~~

## Exemple 3
~~~js
// Destructuring
console.log("ok");
~~~

## A retenir
- Sujet: Destructuring.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 16, 9),
                                                                     (177, 'Classes', '## Objectif
Comprendre Classes en JavaScript.

## Exemple 1
~~~js
class User{ constructor(name){ this.name=name; } }
~~~

## Exemple 2
~~~js
class Admin extends User{}
~~~

## Exemple 3
~~~js
// Classes
console.log("ok");
~~~

## A retenir
- Sujet: Classes.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 17, 9),
                                                                     (178, 'JSON', '## Objectif
Comprendre JSON en JavaScript.

## Exemple 1
~~~js
JSON.parse(''{"a":1}'');
~~~

## Exemple 2
~~~js
JSON.stringify({a:1});
~~~

## Exemple 3
~~~js
// JSON
console.log("ok");
~~~

## A retenir
- Sujet: JSON.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 18, 9),
                                                                     (179, 'Dates', '## Objectif
Comprendre Dates en JavaScript.

## Exemple 1
~~~js
const d = new Date();
~~~

## Exemple 2
~~~js
Date.now();
~~~

## Exemple 3
~~~js
// Dates
console.log("ok");
~~~

## A retenir
- Sujet: Dates.
- Appliquer la syntaxe dans des exemples courts.
- S entrainer avec des exercices.', 19, 9),
                                                                     (180, 'Quiz final JavaScript', '## Objectif
Comprendre Quiz final JavaScript en JavaScript.

Quiz final (15 questions).', 20, 9);

INSERT INTO exercises (id, type, question, choices_json, answer, explanation, order_index, lesson_id) VALUES
                                                                    (1,  'MCQ', 'Quel type est utilisÃ© pour stocker un entier en C ?', '["char","int","float","double"]', 'int', 'int est le type standard pour les entiers.', 1, 1),
                                                                    (2,  'MCQ', 'Quel caractÃ¨re termine une chaÃ®ne en C ?', '["\\n","\\t","\\0","\\r"]', '\0', 'Une chaÃ®ne C est terminÃ©e par le caractÃ¨re nul \\0.', 2, 1),
                                                                    (3,  'MCQ', 'Quel format printf affiche un entier ?', '["%c","%d","%s","%f"]', '%d', '%d est utilisÃ© pour afficher un int.', 3, 1),
                                                                    (4,  'MCQ', 'Quel opÃ©rateur teste lâ€™Ã©galitÃ© en C ?', '["=","==","!=","<="]', '==', '== compare deux valeurs.', 1, 2),
                                                                    (5,  'MCQ', 'Quel opÃ©rateur logique signifie ET ?', '["||","&&","!","&"]', '&&', '&& est le ET logique.', 2, 2),
                                                                    (6,  'MCQ', 'Quel opÃ©rateur incrÃ©mente de 1 ?', '["++","--","+=","**"]', '++', '++ ajoute 1.', 3, 2),
                                                                    (7,  'MCQ', 'Quelle instruction exÃ©cute un bloc si une condition est vraie ?', '["if","else","case","break"]', 'if', 'if teste une condition.', 1, 3),
                                                                    (8,  'MCQ', 'Quelle structure permet un choix multiple ?', '["switch","for","scanf","return"]', 'switch', 'switch choisit selon une valeur.', 2, 3),
                                                                    (9,  'MCQ', 'Quel mot-clÃ© sort dâ€™un switch ?', '["continue","break","return","goto"]', 'break', 'break arrÃªte le switch.', 3, 3),
                                                                    (10, 'MCQ', 'Quelle boucle est adaptÃ©e si on connaÃ®t le nombre dâ€™itÃ©rations ?', '["if","for","switch","typedef"]', 'for', 'for est souvent utilisÃ© avec un compteur.', 1, 4),
                                                                    (11, 'MCQ', 'Quelle boucle teste la condition au dÃ©but ?', '["do-while","while","switch","if"]', 'while', 'while teste avant dâ€™entrer.', 2, 4),
                                                                    (12, 'MCQ', 'Quel mot-clÃ© passe Ã  lâ€™itÃ©ration suivante ?', '["break","continue","return","case"]', 'continue', 'continue saute Ã  lâ€™itÃ©ration suivante.', 3, 4),
                                                                    (13, 'MCQ', 'Quel mot-clÃ© renvoie une valeur depuis une fonction ?', '["break","return","continue","printf"]', 'return', 'return renvoie une valeur.', 1, 5),
                                                                    (14, 'MCQ', 'Comment dÃ©clare-t-on une fonction qui ne renvoie rien ?', '["int f()","void f()","char f()","none f()"]', 'void f()', 'void = pas de valeur retournÃ©e.', 2, 5),
                                                                    (15, 'MCQ', 'Comment appelle-t-on une fonction add(a,b) ?', '["add[a,b]","add(a,b)","add{a,b}","call add"]', 'add(a,b)', 'Lâ€™appel se fait avec parenthÃ¨ses.', 3, 5),
                                                                    (16, 'MCQ', 'Une variable locale est visible...', '["Partout","Dans la fonction seulement","Dans tout le fichier","Jamais"]', 'Dans la fonction seulement', 'Locale = limitÃ©e au bloc/fonction.', 1, 6),
                                                                    (17, 'MCQ', 'Quel mot-clÃ© empÃªche la modification dâ€™une variable ?', '["static","const","extern","signed"]', 'const', 'const rend la variable constante.', 2, 6),
                                                                    (18, 'MCQ', 'Quel mot-clÃ© conserve la valeur entre appels de fonction ?', '["static","auto","register","volatile"]', 'static', 'static conserve la valeur.', 3, 6),
                                                                    (19, 'MCQ', 'Quel est lâ€™index du premier Ã©lÃ©ment dâ€™un tableau ?', '["1","0","-1","2"]', '0', 'Les indices commencent Ã  0.', 1, 7),
                                                                    (20, 'MCQ', 'Comment accÃ©der au 3Ã¨me Ã©lÃ©ment t ?', '["t[3]","t[2]","t(2)","t{2}"]', 't[2]', '3Ã¨me Ã©lÃ©ment = index 2.', 2, 7),
                                                                    (21, 'MCQ', 'Un tableau en C stocke...', '["Des types diffÃ©rents","Un seul type","Uniquement des strings","Uniquement des int"]', 'Un seul type', 'Un tableau contient un seul type.', 3, 7),
                                                                    (22, 'MCQ', 'Quel type est souvent utilisÃ© pour manipuler une chaÃ®ne ?', '["String","char*","int[]","boolean"]', 'char*', 'Souvent char* ou char[] pour une chaÃ®ne.', 1, 8),
                                                                    (23, 'MCQ', 'Quelle fonction calcule la longueur dâ€™une chaÃ®ne ?', '["strlen","strcmp","strcpy","scanf"]', 'strlen', 'strlen renvoie la longueur.', 2, 8),
                                                                    (24, 'MCQ', 'Quelle fonction copie une chaÃ®ne ?', '["strcmp","strcpy","strlen","printf"]', 'strcpy', 'strcpy copie une chaÃ®ne.', 3, 8),
                                                                    (25, 'MCQ', 'Quelle fonction lit une entrÃ©e formatÃ©e ?', '["printf","scanf","puts","fopen"]', 'scanf', 'scanf lit selon un format.', 1, 9),
                                                                    (26, 'MCQ', 'Quel format scanf lit un entier ?', '["%d","%s","%c","%f"]', '%d', '%d lit un int.', 2, 9),
                                                                    (27, 'MCQ', 'Quelle fonction affiche du texte ?', '["printf","scanf","malloc","free"]', 'printf', 'printf affiche selon un format.', 3, 9),
                                                                    (28, 'MCQ', 'Un pointeur stocke...', '["Une valeur","Une adresse","Un fichier","Un tableau"]', 'Une adresse', 'Un pointeur stocke une adresse.', 1, 10),
                                                                    (29, 'MCQ', 'Quel opÃ©rateur obtient lâ€™adresse dâ€™une variable ?', '["*","&","->","."]', '&', '& retourne lâ€™adresse.', 2, 10),
                                                                    (30, 'MCQ', 'Quel opÃ©rateur dÃ©rÃ©fÃ©rence un pointeur ?', '["*","&","%","!"]', '*', '* donne la valeur pointÃ©e.', 3, 10),
                                                                    (31, 'MCQ', 't[i] Ã©quivaut Ã ...', '["&(t+i)","*(t+i)","*(t-i)","(t*i)"]', '*(t+i)', 'Indexation = arithmÃ©tique de pointeur.', 1, 11),
                                                                    (32, 'MCQ', 'Un tableau passÃ© Ã  une fonction devient souvent...', '["Un int","Un pointeur","Un char","Un float"]', 'Un pointeur', 'Les tableaux dÃ©croissent en pointeurs.', 2, 11),
                                                                    (33, 'MCQ', 'Quel est le type de &t[0] (si t est int t[]) ?', '["int","int*","int[]","char*"]', 'int*', 'Adresse du premier Ã©lÃ©ment = int*.', 3, 11),
                                                                    (34, 'MCQ', 'Quelle fonction alloue de la mÃ©moire ?', '["malloc","free","fopen","printf"]', 'malloc', 'malloc alloue un bloc mÃ©moire.', 1, 12),
                                                                    (35, 'MCQ', 'Quelle fonction libÃ¨re la mÃ©moire ?', '["calloc","free","realloc","sizeof"]', 'free', 'free libÃ¨re la mÃ©moire.', 2, 12),
                                                                    (36, 'MCQ', 'Quelle fonction change la taille dâ€™un bloc mÃ©moire ?', '["malloc","realloc","free","scanf"]', 'realloc', 'realloc redimensionne.', 3, 12),
                                                                    (37, 'MCQ', 'struct sert Ã ...', '["RÃ©pÃ©ter une boucle","Regrouper des champs","Ouvrir un fichier","Allouer mÃ©moire"]', 'Regrouper des champs', 'struct regroupe plusieurs variables.', 1, 13),
                                                                    (38, 'MCQ', 'Quel opÃ©rateur accÃ¨de Ã  un champ dâ€™une struct (non pointeur) ?', '["->",".","*","&"]', '.', '. accÃ¨de au champ.', 2, 13),
                                                                    (39, 'MCQ', 'Quel opÃ©rateur accÃ¨de Ã  un champ via pointeur de struct ?', '[".","->","&","%"]', '->', '-> accÃ¨de via pointeur.', 3, 13),
                                                                    (40, 'MCQ', 'typedef sert Ã ...', '["CrÃ©er une boucle","CrÃ©er un alias de type","Ouvrir un fichier","Afficher du texte"]', 'CrÃ©er un alias de type', 'typedef renomme un type.', 1, 14),
                                                                    (41, 'MCQ', 'enum sert Ã ...', '["CrÃ©er des constantes","Lire un fichier","Allouer mÃ©moire","Comparer chaÃ®nes"]', 'CrÃ©er des constantes', 'enum dÃ©finit des constantes.', 2, 14),
                                                                    (42, 'MCQ', 'Quel exemple est un enum correct ?', '["enum A{X,Y};","enum=A;","enum (X,Y)","enum X=1"]', 'enum A{X,Y};', 'Syntaxe valide.', 3, 14),
                                                                    (43, 'MCQ', 'Quelle fonction ouvre un fichier ?', '["open","fopen","file","read"]', 'fopen', 'fopen ouvre un fichier.', 1, 15),
                                                                    (44, 'MCQ', 'Quelle fonction ferme un fichier ?', '["fclose","closefile","end","free"]', 'fclose', 'fclose ferme le fichier.', 2, 15),
                                                                    (45, 'MCQ', 'Quelle fonction Ã©crit formatÃ© dans un fichier ?', '["fprintf","printf","scanf","fgets"]', 'fprintf', 'fprintf Ã©crit dans un fichier.', 3, 15),
                                                                    (46, 'MCQ', 'La rÃ©cursivitÃ© signifie...', '["Une boucle infinie","Une fonction qui sâ€™appelle elle-mÃªme","Un tableau","Un fichier"]', 'Une fonction qui sâ€™appelle elle-mÃªme', 'RÃ©cursivitÃ© = appel de soi.', 1, 16),
                                                                    (47, 'MCQ', 'Une fonction rÃ©cursive doit avoir...', '["Un switch","Un cas dâ€™arrÃªt","Un typedef","Un malloc"]', 'Un cas dâ€™arrÃªt', 'Sinon rÃ©cursion infinie.', 2, 16),
                                                                    (48, 'MCQ', 'La rÃ©cursivitÃ© est souvent utilisÃ©e pour...', '["Tri","CSS","HTML","Audio"]', 'Tri', 'Exemple dâ€™usage: algorithmes.', 3, 16),
                                                                    (49, 'MCQ', '#define sert Ã ...', '["DÃ©finir une macro","Lire un fichier","CrÃ©er une struct","CrÃ©er un pointeur"]', 'DÃ©finir une macro', 'Macro du prÃ©processeur.', 1, 17),
                                                                    (50, 'MCQ', 'Quel est le rÃ´le de #include ?', '["Boucler","Importer un header","Allouer mÃ©moire","Afficher"]', 'Importer un header', '#include inclut un header.', 2, 17),
                                                                    (51, 'MCQ', 'Une macro est traitÃ©e...', '["Ã€ lâ€™exÃ©cution","Avant compilation","AprÃ¨s exÃ©cution","Dans la DB"]', 'Avant compilation', 'PrÃ©processeur avant compilation.', 3, 17),
                                                                    (52, 'MCQ', 'Un pointeur sur fonction pointe vers...', '["Une variable","Une fonction","Un fichier","Une struct"]', 'Une fonction', 'Adresse dâ€™une fonction.', 1, 18),
                                                                    (53, 'MCQ', 'Un usage courant des pointeurs sur fonctions ?', '["Callbacks","CSS","SQL","XML"]', 'Callbacks', 'Callbacks utilisent souvent ce concept.', 2, 18),
                                                                    (54, 'MCQ', 'Quel exemple ressemble Ã  un appel via pf ?', '["pf()","pf->()","*pf","&pf()"]', 'pf()', 'On appelle pf() (ou (*pf)()).', 3, 18),
                                                                    (55, 'MCQ', 'Pourquoi vÃ©rifier le retour de fopen ?', '["Pour la vitesse","Pour Ã©viter un crash si fichier absent","Pour compiler","Pour changer de type"]', 'Pour Ã©viter un crash si fichier absent', 'fopen peut retourner NULL.', 1, 19),
                                                                    (56, 'MCQ', 'scanf peut Ã©chouer si...', '["Mauvais format","Enum absent","Struct vide","PrÃ©processeur"]', 'Mauvais format', 'EntrÃ©e incompatible avec le format.', 2, 19),
                                                                    (57, 'MCQ', 'En cas dâ€™erreur, on peut aider le debug avec...', '["perror","malloc","typedef","switch"]', 'perror', 'perror affiche un message dâ€™erreur.', 3, 19),
                                                                    (58, 'MCQ', 'Quel opÃ©rateur donne lâ€™adresse dâ€™une variable ?', '["*","&","->","."]', '&', '& retourne lâ€™adresse mÃ©moire.', 1, 20),
                                                                    (59, 'MCQ', 'Quel opÃ©rateur dÃ©rÃ©fÃ©rence un pointeur ?', '["*","&","->","."]', '*', '* permet dâ€™accÃ©der Ã  la valeur pointÃ©e.', 2, 20),
                                                                    (60, 'MCQ', 'Quel format printf affiche une chaÃ®ne ?', '["%d","%f","%s","%c"]', '%s', '%s affiche une chaÃ®ne.', 3, 20),
                                                                    (61, 'MCQ', 'Quel est lâ€™index du premier Ã©lÃ©ment dâ€™un tableau ?', '["0","1","-1","2"]', '0', 'Indexation commence Ã  0.', 4, 20),
                                                                    (62, 'MCQ', 'Quelle fonction compare deux chaÃ®nes ?', '["strlen","strcmp","strcpy","scanf"]', 'strcmp', 'strcmp compare le contenu.', 5, 20),
                                                                    (63, 'MCQ', 'Quel caractÃ¨re termine une chaÃ®ne en C ?', '["\\n","\\t","\\0","\\r"]', '\0', 'Fin de chaÃ®ne: \\0.', 6, 20),
                                                                    (64, 'MCQ', 'Quelle instruction sort dâ€™une boucle ?', '["break","continue","return","case"]', 'break', 'break sort de la boucle.', 7, 20),
                                                                    (65, 'MCQ', 'Quelle boucle teste la condition au dÃ©but ?', '["while","do-while","switch","if"]', 'while', 'while teste avant dâ€™entrer.', 8, 20),
                                                                    (66, 'MCQ', 'malloc retourne...', '["Un int","Un pointeur","Un char","Un float"]', 'Un pointeur', 'malloc retourne void*.', 9, 20),
                                                                    (67, 'MCQ', 'Quelle fonction libÃ¨re la mÃ©moire ?', '["malloc","free","strlen","scanf"]', 'free', 'free libÃ¨re la mÃ©moire.', 10, 20),
                                                                    (68, 'MCQ', 'Quelle fonction ouvre un fichier ?', '["open","fopen","file","read"]', 'fopen', 'fopen ouvre un fichier.', 11, 20),
                                                                    (69, 'MCQ', 'Quelle fonction ferme un fichier ?', '["fclose","close","free","end"]', 'fclose', 'fclose ferme le fichier.', 12, 20),
                                                                    (70, 'MCQ', 'struct sert Ã ...', '["Regrouper des champs","Allouer mÃ©moire","Ouvrir un fichier","Afficher"]', 'Regrouper des champs', 'struct regroupe des variables.', 13, 20),
                                                                    (71, 'MCQ', 'typedef sert Ã ...', '["CrÃ©er un alias de type","Boucler","Lire un fichier","Allouer mÃ©moire"]', 'CrÃ©er un alias de type', 'typedef renomme un type.', 14, 20),
                                                                    (72, 'MCQ', 'Le prÃ©processeur traite...', '["AprÃ¨s exÃ©cution","Avant compilation","Dans la DB","Ã€ lâ€™exÃ©cution"]', 'Avant compilation', 'Il agit avant compilation.', 15, 20),
                                                                    (73, 'MCQ', 'Quel type Java stocke un entier ?', '["int","String","boolean","char[]"]', 'int', 'int est utilisÃ© pour les entiers.', 1, 21),
                                                                    (74, 'MCQ', 'Quel type Java stocke du texte ?', '["double","String","int","char"]', 'String', 'String reprÃ©sente du texte.', 2, 21),
                                                                    (75, 'MCQ', 'Quel mot-clÃ© crÃ©e un objet ?', '["new","make","class","this"]', 'new', 'new instancie un objet.', 3, 21),
                                                                    (76, 'MCQ', 'Pour comparer deux String, on utilise plutÃ´t...', '["==","equals()","!=","<="]', 'equals()', 'equals() compare le contenu.', 1, 22),
                                                                    (77, 'MCQ', 'Quel opÃ©rateur signifie ET logique ?', '["||","&&","!","%"]', '&&', '&& est le ET logique.', 2, 22),
                                                                    (78, 'MCQ', 'Quel opÃ©rateur incrÃ©mente ?', '["++","--","**","//"]', '++', '++ ajoute 1.', 3, 22),
                                                                    (79, 'MCQ', 'Quelle instruction teste une condition ?', '["if","for","println","return"]', 'if', 'if exÃ©cute selon une condition.', 1, 23),
                                                                    (80, 'MCQ', 'Quel mot-clÃ© gÃ¨re un choix multiple ?', '["switch","class","new","import"]', 'switch', 'switch choisit selon une valeur.', 2, 23),
                                                                    (81, 'MCQ', 'Quel mot-clÃ© sort dâ€™un switch ?', '["break","continue","throw","static"]', 'break', 'break sort du switch.', 3, 23),
                                                                    (82, 'MCQ', 'Quelle boucle est souvent utilisÃ©e avec un compteur ?', '["for","try","catch","enum"]', 'for', 'for convient au comptage.', 1, 24),
                                                                    (83, 'MCQ', 'Quelle boucle teste au dÃ©but ?', '["while","do-while","switch","if"]', 'while', 'while teste avant dâ€™entrer.', 2, 24),
                                                                    (84, 'MCQ', 'continue sert Ã ...', '["Sortir","Passer Ã  la suite","Lancer une exception","Importer"]', 'Passer Ã  la suite', 'continue saute Ã  lâ€™itÃ©ration suivante.', 3, 24),
                                                                    (85, 'MCQ', 'Une mÃ©thode qui ne renvoie rien utilise...', '["void","null","none","empty"]', 'void', 'void = pas de retour.', 1, 25),
                                                                    (86, 'MCQ', 'Une mÃ©thode static appartient Ã ...', '["Lâ€™objet","La classe","Le fichier","La DB"]', 'La classe', 'static appartient Ã  la classe.', 2, 25),
                                                                    (87, 'MCQ', 'return sert Ã ...', '["Renvoyer une valeur","Importer","Boucler","CrÃ©er un objet"]', 'Renvoyer une valeur', 'return renvoie une valeur.', 3, 25),
                                                                    (88, 'MCQ', 'Une classe est...', '["Un modÃ¨le","Une boucle","Un fichier","Une variable"]', 'Un modÃ¨le', 'Une classe modÃ©lise des objets.', 1, 26),
                                                                    (89, 'MCQ', 'Un objet est crÃ©Ã© avec...', '["new","static","extends","package"]', 'new', 'new crÃ©e une instance.', 2, 26),
                                                                    (90, 'MCQ', 'this rÃ©fÃ©rence...', '["Le parent","Lâ€™objet courant","Le package","Le fichier"]', 'Lâ€™objet courant', 'this = objet actuel.', 3, 26),
                                                                    (91, 'MCQ', 'Un constructeur a le mÃªme nom que...', '["La classe","La mÃ©thode","Le package","Le fichier"]', 'La classe', 'Constructeur = nom de classe.', 1, 27),
                                                                    (92, 'MCQ', 'Un constructeur dÃ©clare un type de retour ?', '["Oui","Non","Seulement int","Seulement void"]', 'Non', 'Le constructeur nâ€™a pas de type.', 2, 27),
                                                                    (93, 'MCQ', 'super() sert Ã ...', '["Appeler le parent","CrÃ©er une interface","Lancer une exception","Boucler"]', 'Appeler le parent', 'super() appelle le constructeur parent.', 3, 27),
                                                                    (94, 'MCQ', 'Encapsulation signifie...', '["public partout","private + accÃ¨s contrÃ´lÃ©","pas de classe","pas de mÃ©thode"]', 'private + accÃ¨s contrÃ´lÃ©', 'On protÃ¨ge via private + getters/setters.', 1, 28),
                                                                    (95, 'MCQ', 'Quel modificateur cache un attribut ?', '["public","private","protected","static"]', 'private', 'private limite lâ€™accÃ¨s.', 2, 28),
                                                                    (96, 'MCQ', 'Les getters servent Ã ...', '["Lire un attribut","CrÃ©er un objet","Importer","Boucler"]', 'Lire un attribut', 'Getter = lecture contrÃ´lÃ©e.', 3, 28),
                                                                    (97, 'MCQ', 'Quel mot-clÃ© permet lâ€™hÃ©ritage ?', '["extends","implements","import","package"]', 'extends', 'extends indique lâ€™hÃ©ritage.', 1, 29),
                                                                    (98, 'MCQ', 'super rÃ©fÃ©rence...', '["Le parent","Le fichier","La DB","Le package"]', 'Le parent', 'super = classe parente.', 2, 29),
                                                                    (99, 'MCQ', 'Override signifie...', '["RedÃ©finir une mÃ©thode","Surcharger un constructeur","CrÃ©er un package","Importer"]', 'RedÃ©finir une mÃ©thode', 'Override = redÃ©finition.', 3, 29),
                                                                    (100,'MCQ', 'Polymorphisme signifie...', '["Plusieurs formes","Une seule forme","Pas dâ€™objets","Pas de classes"]', 'Plusieurs formes', 'RÃ©fÃ©rence parent vers enfant.', 1, 30),
                                                                    (101,'MCQ', 'Le polymorphisme est liÃ© Ã ...', '["HÃ©ritage","HTML","CSS","SQL"]', 'HÃ©ritage', 'Souvent via hÃ©ritage/interfaces.', 2, 30),
                                                                    (102,'MCQ', 'Overloading signifie...', '["Surcharge","RedÃ©finition","Import","Compilation"]', 'Surcharge', 'Overloading = mÃªmes noms, paramÃ¨tres diffÃ©rents.', 3, 30),
                                                                    (103,'MCQ', 'Une interface est...', '["Un contrat","Une boucle","Une variable","Un fichier texte"]', 'Un contrat', 'Une interface dÃ©finit un contrat.', 1, 31),
                                                                    (104,'MCQ', 'Quel mot-clÃ© implÃ©mente une interface ?', '["implements","extends","new","this"]', 'implements', 'implements lie Ã  une interface.', 2, 31),
                                                                    (105,'MCQ', 'Une classe peut implÃ©menter...', '["Plusieurs interfaces","Une seule interface","Aucune mÃ©thode","Uniquement String"]', 'Plusieurs interfaces', 'Java permet plusieurs interfaces.', 3, 31),
                                                                    (106,'MCQ', 'Quel bloc intercepte une exception ?', '["catch","throw","static","final"]', 'catch', 'catch intercepte.', 1, 32),
                                                                    (107,'MCQ', 'Quel bloc sâ€™exÃ©cute toujours ?', '["try","catch","finally","switch"]', 'finally', 'finally sâ€™exÃ©cute toujours.', 2, 32),
                                                                    (108,'MCQ', 'throw sert Ã ...', '["Lancer une exception","Importer","Boucler","CrÃ©er un objet"]', 'Lancer une exception', 'throw lance une exception.', 3, 32),
                                                                    (109,'MCQ', 'Une List...', '["Accepte les doublons","Refuse les doublons","Nâ€™a pas dâ€™ordre","Nâ€™existe pas"]', 'Accepte les doublons', 'List accepte doublons et ordre.', 1, 33),
                                                                    (110,'MCQ', 'ImplÃ©mentation courante de List ?', '["HashMap","ArrayList","TreeSet","File"]', 'ArrayList', 'ArrayList est trÃ¨s utilisÃ©e.', 2, 33),
                                                                    (111,'MCQ', 'Index dâ€™une List commence Ã ...', '["1","0","-1","2"]', '0', 'Indexation Ã  0.', 3, 33),
                                                                    (112,'MCQ', 'Une Map stocke...', '["ClÃ©/Valeur","Valeurs seulement","Boucles","Fichiers"]', 'ClÃ©/Valeur', 'Map associe une clÃ© Ã  une valeur.', 1, 34),
                                                                    (113,'MCQ', 'Une clÃ© dans une Map doit Ãªtre...', '["Unique","DupliquÃ©e","Toujours int","Toujours String"]', 'Unique', 'ClÃ©s uniques.', 2, 34),
                                                                    (114,'MCQ', 'ImplÃ©mentation courante de Map ?', '["HashMap","ArrayList","Scanner","String"]', 'HashMap', 'HashMap est la plus utilisÃ©e.', 3, 34),
                                                                    (115,'MCQ', 'Les gÃ©nÃ©riques servent Ã ...', '["SÃ©curiser les types","Ajouter du CSS","Ouvrir un fichier","CrÃ©er une exception"]', 'SÃ©curiser les types', 'Ils Ã©vitent les casts.', 1, 35),
                                                                    (116,'MCQ', 'Quel exemple est correct ?', '["List<int>","List<String>","List<list>","List<var>"]', 'List<String>', 'On met un type objet, ex String.', 2, 35),
                                                                    (117,'MCQ', 'Sans gÃ©nÃ©riques, on risque...', '["Plus de casts","Moins de mÃ©moire","Plus de vitesse","Pas de compilation"]', 'Plus de casts', 'On doit caster manuellement.', 3, 35),
                                                                    (118,'MCQ', 'Classe qui lit un fichier ligne par ligne ?', '["BufferedReader","HashMap","ArrayList","Math"]', 'BufferedReader', 'BufferedReader lit efficacement.', 1, 36),
                                                                    (119,'MCQ', 'Dans java.nio, quelle classe utilitaire existe ?', '["Files","Lists","Maps","Strings"]', 'Files', 'Files aide Ã  lire/Ã©crire.', 2, 36),
                                                                    (120,'MCQ', 'Lire un fichier peut provoquer...', '["Une exception","Un enum","Un cast","Un switch"]', 'Une exception', 'IO peut lancer IOException.', 3, 36),
                                                                    (121,'MCQ', 'Classe pour une date sans heure ?', '["LocalDate","DateTime","Calendar","System"]', 'LocalDate', 'LocalDate = date.', 1, 37),
                                                                    (122,'MCQ', 'Package moderne pour le temps ?', '["java.time","java.clock","java.util.time","java.date"]', 'java.time', 'java.time est moderne.', 2, 37),
                                                                    (123,'MCQ', 'LocalDateTime contient...', '["Date+heure","Heure seulement","Date seulement","Fichier"]', 'Date+heure', 'LocalDateTime combine date et heure.', 3, 37),
                                                                    (124,'MCQ', 'Stream permet de...', '["Traiter des collections","Compiler","Dessiner","CrÃ©er des fichiers"]', 'Traiter des collections', 'Stream traite en pipeline.', 1, 38),
                                                                    (125,'MCQ', 'OpÃ©ration pour filtrer ?', '["filter","map","reduce","print"]', 'filter', 'filter sÃ©lectionne.', 2, 38),
                                                                    (126,'MCQ', 'OpÃ©ration pour transformer ?', '["map","catch","throw","extends"]', 'map', 'map transforme.', 3, 38),
                                                                    (127,'MCQ', 'Une ToDo doit permettre...', '["Ajouter","Changer Java","CrÃ©er un pointeur","Compiler seulement"]', 'Ajouter', 'Fonction minimale: ajouter.', 1, 39),
                                                                    (128,'MCQ', 'Type adaptÃ© pour stocker des tÃ¢ches ?', '["ArrayList","HashMap","int","double"]', 'ArrayList', 'Liste de tÃ¢ches = ArrayList.', 2, 39),
                                                                    (129,'MCQ', 'Affichage console en Java ?', '["System.out.println","printf","scanf","malloc"]', 'System.out.println', 'println affiche.', 3, 39),
                                                                    (130,'MCQ', 'Quel mot-clÃ© crÃ©e un objet ?', '["new","class","this","static"]', 'new', 'new instancie.', 1, 40),
                                                                    (131,'MCQ', 'Pour comparer deux String, on utilise...', '["==","equals()","!=","<="]', 'equals()', 'equals compare le contenu.', 2, 40),
                                                                    (132,'MCQ', 'Quel mot-clÃ© permet lâ€™hÃ©ritage ?', '["extends","implements","import","package"]', 'extends', 'extends = hÃ©ritage.', 3, 40),
                                                                    (133,'MCQ', 'Quel mot-clÃ© implÃ©mente une interface ?', '["implements","extends","new","this"]', 'implements', 'implements = interface.', 4, 40),
                                                                    (134,'MCQ', 'Quel bloc intercepte une exception ?', '["catch","throw","try","finally"]', 'catch', 'catch intercepte.', 5, 40),
                                                                    (135,'MCQ', 'Quel bloc sâ€™exÃ©cute toujours ?', '["try","catch","finally","switch"]', 'finally', 'finally sâ€™exÃ©cute toujours.', 6, 40),
                                                                    (136,'MCQ', 'Une List...', '["Accepte les doublons","Refuse les doublons","Nâ€™a pas dâ€™ordre","Nâ€™existe pas"]', 'Accepte les doublons', 'List accepte doublons.', 7, 40),
                                                                    (137,'MCQ', 'Une Map stocke...', '["ClÃ©/Valeur","Valeurs seulement","Ordre seulement","Fichiers"]', 'ClÃ©/Valeur', 'Map = clÃ©/valeur.', 8, 40),
                                                                    (138,'MCQ', 'ImplÃ©mentation courante de List ?', '["ArrayList","HashMap","Files","Math"]', 'ArrayList', 'ArrayList est courante.', 9, 40),
                                                                    (139,'MCQ', 'ImplÃ©mentation courante de Map ?', '["HashMap","ArrayList","Scanner","String"]', 'HashMap', 'HashMap est courante.', 10, 40),
                                                                    (140,'MCQ', 'Les gÃ©nÃ©riques servent Ã ...', '["SÃ©curiser les types","Dessiner","Compiler","Ouvrir un port"]', 'SÃ©curiser les types', 'Ils Ã©vitent les casts.', 11, 40),
                                                                    (141,'MCQ', 'Classe qui lit un fichier ligne par ligne ?', '["BufferedReader","ArrayList","HashMap","LocalDate"]', 'BufferedReader', 'Lecture ligne par ligne.', 12, 40),
                                                                    (142,'MCQ', 'Package moderne pour les dates ?', '["java.time","java.util.time","java.clock","java.date"]', 'java.time', 'java.time est moderne.', 13, 40),
                                                                    (143,'MCQ', 'Stream sert Ã ...', '["Traiter des collections","CrÃ©er une DB","Compiler","Dessiner"]', 'Traiter des collections', 'Pipeline de traitement.', 14, 40),
                                                                    (144,'MCQ', 'Polymorphisme signifie...', '["Plusieurs formes","Une seule forme","Pas dâ€™objets","Pas de classes"]', 'Plusieurs formes', 'RÃ©fÃ©rence parent vers enfant.', 15, 40),
                                                                    (145,'MCQ', 'Comment affecter une valeur Ã  une variable en Python ?', '["int x=5","x := 5","x = 5","var x = 5"]', 'x = 5', 'En Python, on affecte avec =.', 1, 41),
                                                                    (146,'MCQ', 'Quel type reprÃ©sente du texte ?', '["int","str","float","bool"]', 'str', 'Le type texte est str.', 2, 41),
                                                                    (147,'MCQ', 'Quel mot-clÃ© crÃ©e une variable ?', '["var","let","Aucun","new"]', 'Aucun', 'Pas de mot-clÃ© pour crÃ©er une variable.', 3, 41),
                                                                    (148,'MCQ', 'Quel opÃ©rateur signifie puissance ?', '["^","**","//","%"]', '**', '** calcule la puissance.', 1, 42),
                                                                    (149,'MCQ', 'Quel opÃ©rateur signifie division entiÃ¨re ?', '["/","//","%","**"]', '//', '// est la division entiÃ¨re.', 2, 42),
                                                                    (150,'MCQ', 'Quel opÃ©rateur logique signifie ET ?', '["&&","and","AND","&"]', 'and', 'and est le ET logique.', 3, 42),
                                                                    (151,'MCQ', 'Quelle instruction dÃ©marre une condition ?', '["if","switch","case","then"]', 'if', 'if dÃ©marre une condition.', 1, 43),
                                                                    (152,'MCQ', 'elif signifie...', '["else if","end if","equal if","error if"]', 'else if', 'elif = else if.', 2, 43),
                                                                    (153,'MCQ', 'Quel bloc correspond Ã  "sinon" ?', '["else","elif","otherwise","default"]', 'else', 'else = sinon.', 3, 43),
                                                                    (154,'MCQ', 'Comment boucler de 0 Ã  4 ?', '["for i in range(5)","for(i=0;i<5;i++)","repeat(5)","loop 5"]', 'for i in range(5)', 'range(5) donne 0..4.', 1, 44),
                                                                    (155,'MCQ', 'Une boucle while sâ€™arrÃªte quand...', '["Condition vraie","Condition fausse","Toujours","Jamais"]', 'Condition fausse', 'while continue tant que condition vraie.', 2, 44),
                                                                    (156,'MCQ', 'range(3) produit...', '["1..3","0..2","0..3","2..3"]', '0..2', 'range(3) = 0,1,2.', 3, 44),
                                                                    (157,'MCQ', 'Comment dÃ©finir une fonction ?', '["function f()","def f():","fun f()","void f()"]', 'def f():', 'def dÃ©finit une fonction.', 1, 45),
                                                                    (158,'MCQ', 'Quel mot-clÃ© renvoie une valeur ?', '["return","give","back","send"]', 'return', 'return renvoie une valeur.', 2, 45),
                                                                    (159,'MCQ', 'Une fonction sans return renvoie...', '["0","None","false","vide"]', 'None', 'Par dÃ©faut, Python renvoie None.', 3, 45),
                                                                    (160,'MCQ', 'Quelle structure est une liste ?', '["()","[]","{}","<>"]', '[]', '[] est une liste.', 1, 46),
                                                                    (161,'MCQ', 'MÃ©thode pour ajouter en fin de liste ?', '["add","push","append","insertLast"]', 'append', 'append ajoute un Ã©lÃ©ment.', 2, 46),
                                                                    (162,'MCQ', 'Quel index correspond au premier Ã©lÃ©ment ?', '["1","0","-1","2"]', '0', 'Index commence Ã  0.', 3, 46),
                                                                    (163,'MCQ', 'Un tuple est...', '["Mutable","Immuable","Une classe","Un fichier"]', 'Immuable', 'Tuple = immuable.', 1, 47),
                                                                    (164,'MCQ', 'Quelle syntaxe crÃ©e un tuple ?', '["[1,2]","(1,2)","{1,2}","<1,2>"]', '(1,2)', '( ) crÃ©e un tuple.', 2, 47),
                                                                    (165,'MCQ', 'Pourquoi utiliser un tuple ?', '["Pour modifier","Pour donnÃ©es fixes","Pour compiler","Pour rÃ©seau"]', 'Pour donnÃ©es fixes', 'Tuple utile pour donnÃ©es immuables.', 3, 47),
                                                                    (166,'MCQ', 'Un dictionnaire se note...', '["[]","()","{}","<>"]', '{}', '{} est un dict.', 1, 48),
                                                                    (167,'MCQ', 'On accÃ¨de Ã  une valeur via...', '["index","clÃ©","pointeur","classe"]', 'clÃ©', 'dict utilise des clÃ©s.', 2, 48),
                                                                    (168,'MCQ', 'MÃ©thode pour parcourir clÃ©s/valeurs ?', '["items()","pairs()","loop()","each()"]', 'items()', 'items() donne (clÃ©,valeur).', 3, 48),
                                                                    (169,'MCQ', 'Un set...', '["Accepte doublons","Refuse doublons","Garde lâ€™ordre toujours","Est une liste"]', 'Refuse doublons', 'Set = pas de doublons.', 1, 49),
                                                                    (170,'MCQ', 'Quelle syntaxe crÃ©e un set ?', '["{1,2}","[1,2]","(1,2)","<1,2>"]', '{1,2}', '{ } crÃ©e un set (si non dict).', 2, 49),
                                                                    (171,'MCQ', 'OpÃ©ration pour ajouter dans un set ?', '["append","add","push","insert"]', 'add', 'add ajoute un Ã©lÃ©ment.', 3, 49),
                                                                    (172,'MCQ', 'len(s) renvoie...', '["La taille","La valeur","Le type","La mÃ©moire"]', 'La taille', 'len renvoie la longueur.', 1, 50),
                                                                    (173,'MCQ', 's.split() renvoie...', '["Un int","Une liste","Un dict","Un tuple"]', 'Une liste', 'split dÃ©coupe en liste.', 2, 50),
                                                                    (174,'MCQ', 'Quel index donne le dernier caractÃ¨re ?', '["0","-1","1","2"]', '-1', 'Index nÃ©gatif depuis la fin.', 3, 50),
                                                                    (175,'MCQ', 'Quelle fonction lit une entrÃ©e utilisateur ?', '["scan()","input()","read()","get()"]', 'input()', 'input lit au clavier.', 1, 51),
                                                                    (176,'MCQ', 'Pour convertir "5" en entier ?', '["int(''5'')","toInt(''5'')","parse(''5'')","integer(''5'')"]', 'int(''5'')', 'int() convertit en entier.', 2, 51),
                                                                    (177,'MCQ', 'print() sert Ã ...', '["Afficher","Compiler","Allouer mÃ©moire","Importer"]', 'Afficher', 'print affiche.', 3, 51),
                                                                    (178,'MCQ', 'Quelle fonction ouvre un fichier ?', '["open()","file()","fopen()","read()"]', 'open()', 'open ouvre un fichier.', 1, 52),
                                                                    (179,'MCQ', 'with open(...) as f: sert Ã ...', '["GÃ©rer auto la fermeture","Boucler","CrÃ©er un dict","Compiler"]', 'GÃ©rer auto la fermeture', 'with ferme automatiquement.', 2, 52),
                                                                    (180,'MCQ', 'MÃ©thode pour lire tout le contenu ?', '["f.read()","f.all()","f.get()","f.load()"]', 'f.read()', 'read lit tout.', 3, 52),
                                                                    (181,'MCQ', 'Quel bloc intercepte une exception ?', '["except","catch","error","trap"]', 'except', 'except intercepte.', 1, 53),
                                                                    (182,'MCQ', 'finally sert Ã ...', '["Toujours exÃ©cuter un bloc","Boucler","CrÃ©er une fonction","Importer"]', 'Toujours exÃ©cuter un bloc', 'finally sâ€™exÃ©cute toujours.', 2, 53),
                                                                    (183,'MCQ', 'Exception pour conversion int("a") ?', '["ValueError","TypeError","IOError","KeyError"]', 'ValueError', 'Conversion invalide -> ValueError.', 3, 53),
                                                                    (184,'MCQ', 'Comment importer math ?', '["import math","include math","using math","require math"]', 'import math', 'import charge le module.', 1, 54),
                                                                    (185,'MCQ', 'math.sqrt(9) renvoie...', '["3","9","81","0"]', '3', 'Racine carrÃ©e de 9 = 3.', 2, 54),
                                                                    (186,'MCQ', 'random.choice([1,2]) fait...', '["Choisit un Ã©lÃ©ment","Trie la liste","Vide la liste","Additionne"]', 'Choisit un Ã©lÃ©ment', 'choice retourne un Ã©lÃ©ment alÃ©atoire.', 3, 54),
                                                                    (187,'MCQ', 'Une comprÃ©hension de liste produit...', '["Une liste","Un dict","Un fichier","Un tuple"]', 'Une liste', 'List comprehension -> list.', 1, 55),
                                                                    (188,'MCQ', 'Exemple correct de comprÃ©hension ?', '["[x*x for x in range(5)]","(x*x for x in range(5))","{x*x in range(5)}","x*x for x"]', '[x*x for x in range(5)]', 'Syntaxe valide.', 2, 55),
                                                                    (189,'MCQ', 'Avantage principal ?', '["Plus lisible/compact","Plus lent","Impossible","Obligatoire"]', 'Plus lisible/compact', 'Souvent plus compact.', 3, 55),
                                                                    (190,'MCQ', 'lambda sert Ã ...', '["CrÃ©er une petite fonction","CrÃ©er un module","CrÃ©er un fichier","CrÃ©er un set"]', 'CrÃ©er une petite fonction', 'lambda = fonction anonyme.', 1, 56),
                                                                    (191,'MCQ', 'sorted(l, key=lambda x: x) utilise...', '["Une clÃ© de tri","Un import","Une exception","Un dict"]', 'Une clÃ© de tri', 'key dÃ©finit le critÃ¨re.', 2, 56),
                                                                    (192,'MCQ', 'map() retourne...', '["Un itÃ©rateur","Toujours une liste","Toujours un dict","Un fichier"]', 'Un itÃ©rateur', 'map retourne un itÃ©rateur.', 3, 56),
                                                                    (193,'MCQ', 'class User: dÃ©finit...', '["Une classe","Une fonction","Un fichier","Une boucle"]', 'Une classe', 'class dÃ©finit une classe.', 1, 57),
                                                                    (194,'MCQ', '__init__ est...', '["Le constructeur","Une boucle","Un module","Un fichier"]', 'Le constructeur', '__init__ initialise lâ€™objet.', 2, 57),
                                                                    (195,'MCQ', 'self reprÃ©sente...', '["Lâ€™objet courant","Le parent","Le module","Le fichier"]', 'Lâ€™objet courant', 'self = instance actuelle.', 3, 57),
                                                                    (196,'MCQ', 'pip sert Ã ...', '["Installer des packages","Compiler Python","CrÃ©er une DB","GÃ©rer les boucles"]', 'Installer des packages', 'pip installe des bibliothÃ¨ques.', 1, 58),
                                                                    (197,'MCQ', 'Commande pour installer requests ?', '["pip install requests","pip add requests","install requests","python install requests"]', 'pip install requests', 'Commande standard pip.', 2, 58),
                                                                    (198,'MCQ', 'Un package est...', '["Une bibliothÃ¨que","Une variable","Un fichier texte","Un pointeur"]', 'Une bibliothÃ¨que', 'Package = librairie.', 3, 58),
                                                                    (199,'MCQ', 'Compter des mots nÃ©cessite souvent...', '["split()","malloc()","printf()","extends"]', 'split()', 'split dÃ©coupe les mots.', 1, 59),
                                                                    (200,'MCQ', 'Structure idÃ©ale pour compter occurrences ?', '["dict","tuple","set","float"]', 'dict', 'dict = clÃ© -> compteur.', 2, 59),
                                                                    (201,'MCQ', 'Lire un fichier texte en Python ?', '["with open(...) as f","fopen()","scanf()","System.in"]', 'with open(...) as f', 'with open est idiomatique.', 3, 59),
                                                                    (202,'MCQ', 'Quel symbole commence un commentaire ?', '["//","#","/*","--"]', '#', '# dÃ©marre un commentaire.', 1, 60),
                                                                    (203,'MCQ', 'Quelle structure est une liste ?', '["()","[]","{}","<>"]', '[]', '[] est une liste.', 2, 60),
                                                                    (204,'MCQ', 'Quelle structure est un dictionnaire ?', '["()","[]","{}","<>"]', '{}', '{} est un dict.', 3, 60),
                                                                    (205,'MCQ', 'Quelle fonction donne la longueur ?', '["size()","len()","length()","count()"]', 'len()', 'len() renvoie la taille.', 4, 60),
                                                                    (206,'MCQ', 'Comment dÃ©finir une fonction ?', '["function f()","def f():","fun f()","void f()"]', 'def f():', 'def dÃ©finit une fonction.', 5, 60),
                                                                    (207,'MCQ', 'elif signifie...', '["else if","end if","error if","equal if"]', 'else if', 'elif = else if.', 6, 60),
                                                                    (208,'MCQ', 'range(3) produit...', '["1..3","0..2","0..3","2..3"]', '0..2', 'range(3)=0,1,2.', 7, 60),
                                                                    (209,'MCQ', 'Quel opÃ©rateur signifie ET logique ?', '["&&","and","AND","&"]', 'and', 'and est lâ€™opÃ©rateur logique.', 8, 60),
                                                                    (210,'MCQ', 'Quel opÃ©rateur signifie OU logique ?', '["||","or","OR","|"]', 'or', 'or est lâ€™opÃ©rateur logique.', 9, 60),
                                                                    (211,'MCQ', '2**3 vaut...', '["6","8","9","5"]', '8', '** calcule la puissance.', 10, 60),
                                                                    (212,'MCQ', 'Quel mot-clÃ© renvoie une valeur ?', '["return","give","back","send"]', 'return', 'return renvoie une valeur.', 11, 60),
                                                                    (213,'MCQ', 'try/except sert Ã ...', '["GÃ©rer les erreurs","CrÃ©er un module","CrÃ©er une liste","Lire une DB"]', 'GÃ©rer les erreurs', 'try/except gÃ¨re exceptions.', 12, 60),
                                                                    (214,'MCQ', 'with open(...) as f: sert Ã ...', '["Fermer auto le fichier","Boucler","CrÃ©er une classe","Installer pip"]', 'Fermer auto le fichier', 'with gÃ¨re la fermeture.', 13, 60),
                                                                    (215,'MCQ', 'Une liste accepte...', '["Des doublons","Jamais de doublons","Seulement int","Seulement str"]', 'Des doublons', 'Les listes acceptent doublons.', 14, 60),
                                                                    (216,'MCQ', 'Un set en Python...', '["Refuse les doublons","Accepte les doublons","Garde toujours lâ€™ordre","Est un dict"]', 'Refuse les doublons', 'Un set ne contient pas de doublons.', 15, 60),
                                                                    (649, 'MCQ', 'Quel type C++ est adapte pour un entier ?', '["int","double","bool","char"]', 'int', 'int est le type entier courant.', 1, 61),
                                                                    (650, 'MCQ', 'Quel type stocke vrai ou faux ?', '["bool","int","string","float"]', 'bool', 'bool represente une valeur booleenne.', 2, 61),
                                                                    (651, 'MCQ', 'Quel mot-cle permet deduction de type ?', '["auto","typedef","using","const"]', 'auto', 'auto laisse le compilateur deduire le type.', 3, 61),
                                                                    (652, 'MCQ', 'Quelle bibliotheque fournit cout et cin ?', '["<iostream>","<vector>","<string>","<cmath>"]', '<iostream>', '<iostream> contient cout et cin.', 1, 62),
                                                                    (653, 'MCQ', 'Quel objet lit au clavier ?', '["std::cin","std::cout","std::cerr","printf"]', 'std::cin', 'std::cin lit depuis l entree standard.', 2, 62),
                                                                    (654, 'MCQ', 'Quel operateur envoie dans cout ?', '["<<",">>","==","+="]', '<<', '<< envoie les donnees vers cout.', 3, 62),
                                                                    (655, 'MCQ', 'Quel operateur teste egalite ?', '["==","=","!=","<"]', '==', '== compare deux valeurs.', 1, 63),
                                                                    (656, 'MCQ', 'Quel operateur calcule le reste ?', '["%","/","*","^"]', '%', '% donne le reste de division.', 2, 63),
                                                                    (657, 'MCQ', 'Quel operateur incremente de 1 ?', '["++","--","+=","**"]', '++', '++ ajoute 1.', 3, 63),
                                                                    (658, 'MCQ', 'Quel mot-cle demarre une condition ?', '["if","for","switch","case"]', 'if', 'if demarre un bloc conditionnel.', 1, 64),
                                                                    (659, 'MCQ', 'Quel mot-cle gere plusieurs cas ?', '["switch","while","break","return"]', 'switch', 'switch selectionne selon une valeur.', 2, 64),
                                                                    (660, 'MCQ', 'Quel mot-cle sort d un case ?', '["break","continue","goto","return"]', 'break', 'break termine le case courant.', 3, 64),
                                                                    (661, 'MCQ', 'Quelle boucle est adaptee a un compteur ?', '["for","if","switch","typedef"]', 'for', 'for est souvent utilise avec un compteur.', 1, 65),
                                                                    (662, 'MCQ', 'Quelle boucle teste avant entree ?', '["while","do-while","for-each","switch"]', 'while', 'while teste la condition avant d entrer.', 2, 65),
                                                                    (663, 'MCQ', 'Quelle boucle execute au moins une fois ?', '["do-while","while","for","if"]', 'do-while', 'do-while execute le bloc avant le test.', 3, 65),
                                                                    (664, 'MCQ', 'Ou place-t-on le type de retour ?', '["avant le nom","apres les params","dans le corps","apres ;"]', 'avant le nom', 'Le type de retour est avant le nom de la fonction.', 1, 66),
                                                                    (665, 'MCQ', 'Quel prototype est correct ?', '["int add(int a,int b);","add int(a,b);","int add{a,b};","function add(a,b);"]', 'int add(int a,int b);', 'Un prototype finit par un point-virgule.', 2, 66),
                                                                    (666, 'MCQ', 'Comment passer un parametre par reference ?', '["ajouter & au param","ajouter * au retour","utiliser auto","utiliser const"]', 'ajouter & au param', 'Le & sur un parametre passe par reference.', 3, 66),
                                                                    (667, 'MCQ', 'Quel symbole declare une reference ?', '["&","*","#","@"]', '&', '& apres le type declare une reference.', 1, 67),
                                                                    (668, 'MCQ', 'Quel symbole dereference un pointeur ?', '["*","&","->","."]', '*', '* donne la valeur pointee.', 2, 67),
                                                                    (669, 'MCQ', 'Quelle valeur represente un pointeur nul ?', '["nullptr","NULLSTR","0.0","false"]', 'nullptr', 'nullptr est la valeur pointeur nul moderne.', 3, 67),
                                                                    (670, 'MCQ', 'Quel conteneur est dynamique en C++ ?', '["std::vector","std::array","std::pair","std::tuple"]', 'std::vector', 'std::vector grandit dynamiquement.', 1, 68),
                                                                    (671, 'MCQ', 'Quelle methode ajoute un element a la fin ?', '["push_back","push_front","append","insert_at"]', 'push_back', 'push_back ajoute en fin de vector.', 2, 68),
                                                                    (672, 'MCQ', 'Quelle methode donne la taille ?', '["size","length","count","capacity"]', 'size', 'size() retourne le nombre d elements.', 3, 68),
                                                                    (673, 'MCQ', 'Quel type represente une chaine ?', '["std::string","char*","String","text"]', 'std::string', 'std::string est le type standard.', 1, 69),
                                                                    (674, 'MCQ', 'Quelle methode donne la longueur d une string ?', '["size","len","count","capacity"]', 'size', 'size() ou length() donne la longueur.', 2, 69),
                                                                    (675, 'MCQ', 'Quel operateur concatene deux strings ?', '["+","&","*","/"]', '+', '+ concatene les strings.', 3, 69),
                                                                    (676, 'MCQ', 'Acces par defaut d une class ?', '["private","public","protected","static"]', 'private', 'Dans une class, l acces par defaut est private.', 1, 70),
                                                                    (677, 'MCQ', 'Acces par defaut d un struct ?', '["public","private","protected","static"]', 'public', 'Dans un struct, l acces par defaut est public.', 2, 70),
                                                                    (678, 'MCQ', 'Quel mot-cle declare une classe ?', '["class","struct","object","type"]', 'class', 'class demarre une declaration de classe.', 3, 70),
                                                                    (679, 'MCQ', 'Un constructeur a le meme nom que ...', '["la classe","la methode","le fichier","le namespace"]', 'la classe', 'Le constructeur porte le nom de la classe.', 1, 71),
                                                                    (680, 'MCQ', 'Un constructeur sans parametres est ...', '["constructeur par defaut","copy constructor","move constructor","delegue"]', 'constructeur par defaut', 'Il ne prend aucun parametre.', 2, 71),
                                                                    (681, 'MCQ', 'Ou place-t-on la liste d initialisation ?', '["apres :","dans le corps","avant le nom","apres ;"]', 'apres :', 'La liste suit le : apres la signature.', 3, 71),
                                                                    (682, 'MCQ', 'Quel acces protege les champs ?', '["private","public","static","inline"]', 'private', 'private limite l acces aux membres.', 1, 72),
                                                                    (683, 'MCQ', 'Quel acces permet l utilisation externe ?', '["public","private","protected","const"]', 'public', 'public est visible partout.', 2, 72),
                                                                    (684, 'MCQ', 'But des getters/setters ?', '["controler l acces","augmenter la vitesse","eviter headers","reduire memoire"]', 'controler l acces', 'Ils controlent la lecture et l ecriture.', 3, 72),
                                                                    (685, 'MCQ', 'Syntaxe d heritage public ?', '["class B : public A","class B A","B extends A","inherit B A"]', 'class B : public A', 'Le : public herite des membres publics.', 1, 73),
                                                                    (686, 'MCQ', 'Avec heritage public, les membres public du parent deviennent ...', '["publics","prives","inaccessibles","static"]', 'publics', 'public reste public dans l enfant.', 2, 73),
                                                                    (687, 'MCQ', 'Comment heriter de deux classes ?', '["class B : public A, public C","class B : A+C","class B implements A,C","class B extends A,C"]', 'class B : public A, public C', 'On separe les bases par des virgules.', 3, 73),
                                                                    (688, 'MCQ', 'Mot-cle pour liaison dynamique ?', '["virtual","static","inline","const"]', 'virtual', 'virtual active le dispatch dynamique.', 1, 74),
                                                                    (689, 'MCQ', 'Mot-cle pour signaler une surcharge ?', '["override","final","mutable","friend"]', 'override', 'override indique une redefinition.', 2, 74),
                                                                    (690, 'MCQ', 'Le polymorphisme permet ...', '["appel d une methode derivee via base","supprimer les classes","changer la taille","eviter headers"]', 'appel d une methode derivee via base', 'Un pointeur base appelle la methode derivee.', 3, 74),
                                                                    (691, 'MCQ', 'Mot-cle pour template ?', '["template","generic","typename","auto"]', 'template', 'template demarre une declaration generique.', 1, 75),
                                                                    (692, 'MCQ', 'Parametre de type correct ?', '["typename T","int T","var T","class 1"]', 'typename T', 'typename T declare un parametre de type.', 2, 75),
                                                                    (693, 'MCQ', 'Exemple d instanciation ?', '["std::vector<int>","std::vector","vector<int,int>","int<vector>"]', 'std::vector<int>', 'On fournit un type entre chevrons.', 3, 75),
                                                                    (694, 'MCQ', 'Algorithme pour trier ?', '["std::sort","std::shuffle","std::swap","std::merge"]', 'std::sort', 'std::sort trie une plage.', 1, 76),
                                                                    (695, 'MCQ', 'Algorithme pour chercher une valeur ?', '["std::find","std::copy","std::move","std::fill"]', 'std::find', 'std::find cherche une valeur.', 2, 76),
                                                                    (696, 'MCQ', 'Les algorithmes STL utilisent ...', '["des iterateurs","des macros","des threads","des classes virtuelles"]', 'des iterateurs', 'Ils operent sur des iterateurs.', 3, 76),
                                                                    (697, 'MCQ', 'Flux pour lire un fichier ?', '["std::ifstream","std::ofstream","std::fstream","std::cout"]', 'std::ifstream', 'ifstream lit depuis un fichier.', 1, 77),
                                                                    (698, 'MCQ', 'Flux pour ecrire un fichier ?', '["std::ofstream","std::cin","std::cerr","std::ifstream"]', 'std::ofstream', 'ofstream ecrit vers un fichier.', 2, 77),
                                                                    (699, 'MCQ', 'Verifier ouverture d un fichier ?', '["is_open()","opened()","ready()","valid()"]', 'is_open()', 'is_open() indique si le fichier est ouvert.', 3, 77),
                                                                    (700, 'MCQ', 'Operateur d allocation dynamique ?', '["new","malloc","alloc","create"]', 'new', 'new alloue sur le tas.', 1, 78),
                                                                    (701, 'MCQ', 'Operateur de liberation ?', '["delete","free","remove","drop"]', 'delete', 'delete libere la memoire allouee par new.', 2, 78),
                                                                    (702, 'MCQ', 'Smart pointer pour propriete unique ?', '["std::unique_ptr","std::shared_ptr","std::weak_ptr","std::auto_ptr"]', 'std::unique_ptr', 'unique_ptr possede la ressource seul.', 3, 78),
                                                                    (703, 'MCQ', 'Bloc pour gerer erreurs ?', '["try/catch","if/else","switch","for"]', 'try/catch', 'try/catch capture les exceptions.', 1, 79),
                                                                    (704, 'MCQ', 'Mot-cle pour lancer une exception ?', '["throw","raise","panic","emit"]', 'throw', 'throw envoie une exception.', 2, 79),
                                                                    (705, 'MCQ', 'Type de base des exceptions standard ?', '["std::exception","std::error","std::fault","std::throwable"]', 'std::exception', 'std::exception est la base des exceptions standard.', 3, 79),
                                                                    (706, 'MCQ', 'Quel en-tete fournit std::vector ?', '["<vector>","<array>","<map>","<list>"]', '<vector>', '<vector> declare std::vector.', 1, 80),
                                                                    (707, 'MCQ', 'Quel operateur envoie dans std::cout ?', '["<<",">>","==","+="]', '<<', '<< ecrit vers cout.', 2, 80),
                                                                    (708, 'MCQ', 'Quel mot-cle active le polymorphisme ?', '["virtual","static","inline","const"]', 'virtual', 'virtual active le dispatch dynamique.', 3, 80),
                                                                    (709, 'MCQ', 'Quelle instruction cree un objet sur le tas ?', '["new","auto","stack","make"]', 'new', 'new alloue un objet dynamique.', 4, 80),
                                                                    (710, 'MCQ', 'Quel conteneur associe cle et valeur ?', '["std::map","std::vector","std::string","std::array"]', 'std::map', 'std::map stocke des paires cle/valeur.', 5, 80),
                                                                    (711, 'MCQ', 'Quel mecanisme signale une erreur ?', '["throw","break","return","goto"]', 'throw', 'throw signale une exception.', 6, 80),
                                                                    (712, 'MCQ', 'Comment acceder a un membre via pointeur ?', '["->",".","*","&"]', '->', '-> accede au membre via pointeur.', 7, 80),
                                                                    (713, 'MCQ', 'Quel algorithme trie un tableau ?', '["std::sort","std::find","std::copy","std::fill"]', 'std::sort', 'std::sort trie une plage.', 8, 80),
                                                                    (714, 'MCQ', 'Quelle methode donne la taille d une string ?', '["size()","len()","count()","capacity()"]', 'size()', 'size() retourne la longueur.', 9, 80),
                                                                    (715, 'MCQ', 'Quelle syntaxe definit un template ?', '["template<typename T>","generic<T>","auto<T>","using<T>"]', 'template<typename T>', 'C est la syntaxe de template.', 10, 80),
                                                                    (716, 'MCQ', 'MySQL est un ...', '["SGBD relationnel","editeur de texte","OS","navigateur"]', 'SGBD relationnel', 'MySQL est un systeme de gestion de base relationnelle.', 1, 81),
                                                                    (717, 'MCQ', 'SQL sert a ...', '["interroger des donnees","compiler du code","dessiner UI","tester reseau"]', 'interroger des donnees', 'SQL est le langage de requetes.', 2, 81),
                                                                    (718, 'MCQ', 'Une table contient ...', '["colonnes et lignes","seulement des fichiers","des sockets","des indexes"]', 'colonnes et lignes', 'Une table est composee de colonnes et lignes.', 3, 81),
                                                                    (719, 'MCQ', 'Commande pour creer une base ?', '["CREATE DATABASE","CREATE TABLE","USE","ALTER DATABASE"]', 'CREATE DATABASE', 'CREATE DATABASE cree une base.', 1, 82),
                                                                    (720, 'MCQ', 'Commande pour choisir une base ?', '["USE","OPEN","SELECT","SET DB"]', 'USE', 'USE selectionne la base active.', 2, 82),
                                                                    (721, 'MCQ', 'Commande pour creer une table ?', '["CREATE TABLE","INSERT INTO","ALTER TABLE","DROP TABLE"]', 'CREATE TABLE', 'CREATE TABLE definit une table.', 3, 82),
                                                                    (722, 'MCQ', 'Commande pour ajouter une ligne ?', '["INSERT INTO","UPDATE","SELECT","DELETE"]', 'INSERT INTO', 'INSERT INTO ajoute des donnees.', 1, 83),
                                                                    (723, 'MCQ', 'Clause pour fournir les valeurs ?', '["VALUES","WHERE","GROUP BY","ORDER BY"]', 'VALUES', 'VALUES liste les valeurs a inserer.', 2, 83),
                                                                    (724, 'MCQ', 'Quel mot pour valeur nulle ?', '["NULL","EMPTY","VOID","NONE"]', 'NULL', 'NULL represente une absence de valeur.', 3, 83),
                                                                    (725, 'MCQ', 'Quelle clause choisit les colonnes ?', '["SELECT","FROM","WHERE","JOIN"]', 'SELECT', 'SELECT definit les colonnes.', 1, 84),
                                                                    (726, 'MCQ', 'Quelle clause indique la table ?', '["FROM","SELECT","ORDER BY","LIMIT"]', 'FROM', 'FROM indique la table source.', 2, 84),
                                                                    (727, 'MCQ', 'Quel symbole selectionne toutes les colonnes ?', '["*","%","#","@"]', '*', '* selectionne toutes les colonnes.', 3, 84),
                                                                    (728, 'MCQ', 'Clause pour filtrer les lignes ?', '["WHERE","GROUP BY","HAVING","LIMIT"]', 'WHERE', 'WHERE filtre les lignes.', 1, 85),
                                                                    (729, 'MCQ', 'Operateur pour egalite ?', '["=","==","<>","LIKE"]', '=', '= teste l egalite en SQL.', 2, 85),
                                                                    (730, 'MCQ', 'Operateur pour motif texte ?', '["LIKE","IN","BETWEEN","ORDER BY"]', 'LIKE', 'LIKE compare a un motif.', 3, 85),
                                                                    (731, 'MCQ', 'Clause pour trier ?', '["ORDER BY","GROUP BY","HAVING","SORT"]', 'ORDER BY', 'ORDER BY trie les lignes.', 1, 86),
                                                                    (732, 'MCQ', 'Mot pour tri descendant ?', '["DESC","DOWN","LOW","REVERSE"]', 'DESC', 'DESC trie en ordre decroissant.', 2, 86),
                                                                    (733, 'MCQ', 'Clause pour limiter les resultats ?', '["LIMIT","TOP","FIRST","OFFSET"]', 'LIMIT', 'LIMIT reduit le nombre de lignes.', 3, 86),
                                                                    (734, 'MCQ', 'Fonction pour compter ?', '["COUNT","SUM","AVG","MAX"]', 'COUNT', 'COUNT compte les lignes.', 1, 87),
                                                                    (735, 'MCQ', 'Fonction pour somme ?', '["SUM","COUNT","MIN","AVG"]', 'SUM', 'SUM additionne les valeurs.', 2, 87),
                                                                    (736, 'MCQ', 'Fonction pour moyenne ?', '["AVG","MEAN","SUM","COUNT"]', 'AVG', 'AVG calcule la moyenne.', 3, 87),
                                                                    (737, 'MCQ', 'GROUP BY sert a ...', '["regrouper les lignes","trier les lignes","supprimer lignes","joindre tables"]', 'regrouper les lignes', 'GROUP BY regroupe par valeurs.', 1, 88),
                                                                    (738, 'MCQ', 'HAVING filtre ...', '["les groupes","les colonnes","les index","les vues"]', 'les groupes', 'HAVING filtre apres GROUP BY.', 2, 88),
                                                                    (739, 'MCQ', 'Avec GROUP BY, on utilise souvent ...', '["fonctions agregat","UPDATE","DELETE","TRUNCATE"]', 'fonctions agregat', 'COUNT, SUM, AVG sont frequents.', 3, 88),
                                                                    (740, 'MCQ', 'INNER JOIN retourne ...', '["lignes correspondantes","toutes lignes gauche","toutes lignes droite","aucune ligne"]', 'lignes correspondantes', 'INNER JOIN ne garde que les correspondances.', 1, 89),
                                                                    (741, 'MCQ', 'Clause de jointure ?', '["ON","WHERE","GROUP BY","LIMIT"]', 'ON', 'ON definit la condition de jointure.', 2, 89),
                                                                    (742, 'MCQ', 'INNER JOIN est equivalent a ...', '["JOIN","LEFT JOIN","RIGHT JOIN","CROSS JOIN"]', 'JOIN', 'JOIN sans precision est un INNER JOIN.', 3, 89),
                                                                    (743, 'MCQ', 'LEFT JOIN garde ...', '["toutes lignes gauche","seulement correspondances","toutes lignes droite","aucune"]', 'toutes lignes gauche', 'LEFT JOIN garde toutes les lignes de gauche.', 1, 90),
                                                                    (744, 'MCQ', 'Valeurs non trouvees a droite ?', '["NULL","0","empty","false"]', 'NULL', 'Les colonnes de droite deviennent NULL.', 2, 90),
                                                                    (745, 'MCQ', 'LEFT JOIN par rapport a INNER JOIN ...', '["inclut lignes sans correspondance","plus rapide toujours","supprime doublons","invalide"]', 'inclut lignes sans correspondance', 'LEFT JOIN inclut les non correspondances.', 3, 90),
                                                                    (746, 'MCQ', 'Mot pour utiliser une sous requete dans WHERE ?', '["IN","ON","LIMIT","ORDER"]', 'IN', 'IN accepte une liste issue d une sous requete.', 1, 91),
                                                                    (747, 'MCQ', 'Une sous requete scalaire retourne ...', '["une seule valeur","une table complete","toujours NULL","un index"]', 'une seule valeur', 'Une sous requete scalaire renvoie une valeur.', 2, 91),
                                                                    (748, 'MCQ', 'Dans FROM, une sous requete doit avoir ...', '["un alias","une cle primaire","un index","une vue"]', 'un alias', 'Une table derivee doit etre nommee.', 3, 91),
                                                                    (749, 'MCQ', 'Commande pour modifier des lignes ?', '["UPDATE","INSERT","DELETE","SELECT"]', 'UPDATE', 'UPDATE modifie des lignes.', 1, 92),
                                                                    (750, 'MCQ', 'Clause pour definir valeurs ?', '["SET","VALUES","FROM","WHERE"]', 'SET', 'SET assigne les nouvelles valeurs.', 2, 92),
                                                                    (751, 'MCQ', 'Pourquoi utiliser WHERE avec UPDATE ?', '["eviter tout modifier","trier les lignes","creer table","indexer"]', 'eviter tout modifier', 'Sans WHERE, toutes les lignes sont modifiees.', 3, 92),
                                                                    (752, 'MCQ', 'Commande pour supprimer des lignes ?', '["DELETE","DROP","TRUNCATE","REMOVE"]', 'DELETE', 'DELETE supprime des lignes.', 1, 93),
                                                                    (753, 'MCQ', 'Sans WHERE, DELETE ...', '["supprime toutes lignes","supprime une seule","echoue","cree table"]', 'supprime toutes lignes', 'DELETE sans WHERE vide la table.', 2, 93),
                                                                    (754, 'MCQ', 'TRUNCATE est ...', '["suppression rapide de toute table","une jointure","une vue","un index"]', 'suppression rapide de toute table', 'TRUNCATE vide la table rapidement.', 3, 93),
                                                                    (755, 'MCQ', 'Commande pour creer un index ?', '["CREATE INDEX","ADD INDEX","MAKE INDEX","INDEX NEW"]', 'CREATE INDEX', 'CREATE INDEX cree un index.', 1, 94),
                                                                    (756, 'MCQ', 'Role principal d un index ?', '["accelerer recherche","chiffrer donnees","compresser table","supprimer doublons"]', 'accelerer recherche', 'Un index accelere les recherches.', 2, 94),
                                                                    (757, 'MCQ', 'Index unique garantit ...', '["unicite","ordre","non null","aucune duplication de table"]', 'unicite', 'UNIQUE empeche les doublons.', 3, 94),
                                                                    (758, 'MCQ', 'Contrainte pour cle primaire ?', '["PRIMARY KEY","FOREIGN KEY","UNIQUE","CHECK"]', 'PRIMARY KEY', 'PRIMARY KEY identifie chaque ligne.', 1, 95),
                                                                    (759, 'MCQ', 'Contrainte pour lien entre tables ?', '["FOREIGN KEY","PRIMARY KEY","INDEX","DEFAULT"]', 'FOREIGN KEY', 'FOREIGN KEY reference une autre table.', 2, 95),
                                                                    (760, 'MCQ', 'Contrainte pour valeur unique ?', '["UNIQUE","CHECK","NOT NULL","AUTO_INCREMENT"]', 'UNIQUE', 'UNIQUE impose des valeurs uniques.', 3, 95),
                                                                    (761, 'MCQ', 'Demarrer une transaction ?', '["START TRANSACTION","BEGIN","OPEN","INIT"]', 'START TRANSACTION', 'START TRANSACTION demarre une transaction.', 1, 96),
                                                                    (762, 'MCQ', 'Valider une transaction ?', '["COMMIT","SAVE","APPLY","PUSH"]', 'COMMIT', 'COMMIT valide les changements.', 2, 96),
                                                                    (763, 'MCQ', 'Annuler une transaction ?', '["ROLLBACK","CANCEL","REVERT","UNDO"]', 'ROLLBACK', 'ROLLBACK annule les changements.', 3, 96),
                                                                    (764, 'MCQ', 'Commande pour creer une vue ?', '["CREATE VIEW","CREATE TABLE","CREATE INDEX","CREATE PROCEDURE"]', 'CREATE VIEW', 'CREATE VIEW cree une vue.', 1, 97),
                                                                    (765, 'MCQ', 'Une vue stocke ...', '["une requete","des lignes physiques","des fichiers","des triggers"]', 'une requete', 'Une vue stocke une requete.', 2, 97),
                                                                    (766, 'MCQ', 'Les donnees d une vue viennent ...', '["des tables sources","d un fichier","d un index","du cache navigateur"]', 'des tables sources', 'La vue repose sur des tables.', 3, 97),
                                                                    (767, 'MCQ', 'Commande pour creer procedure ?', '["CREATE PROCEDURE","CREATE FUNCTION","CREATE VIEW","CREATE TRIGGER"]', 'CREATE PROCEDURE', 'CREATE PROCEDURE cree une procedure.', 1, 98),
                                                                    (768, 'MCQ', 'Commande pour appeler une procedure ?', '["CALL","RUN","EXECUTE","DO"]', 'CALL', 'CALL execute une procedure.', 2, 98),
                                                                    (769, 'MCQ', 'Une procedure peut ...', '["avoir des parametres","retourner une table obligatoire","etre une vue","remplacer SELECT"]', 'avoir des parametres', 'Les procedures acceptent des parametres.', 3, 98),
                                                                    (770, 'MCQ', 'Commande pour creer fonction ?', '["CREATE FUNCTION","CREATE PROCEDURE","CREATE VIEW","CREATE INDEX"]', 'CREATE FUNCTION', 'CREATE FUNCTION cree une fonction.', 1, 99),
                                                                    (771, 'MCQ', 'Une fonction doit declarer ...', '["RETURNS","OUTPUT","RETURNING","AS"]', 'RETURNS', 'RETURNS definit le type retourne.', 2, 99),
                                                                    (772, 'MCQ', 'Une fonction est appelee dans ...', '["SELECT","INSERT seulement","DROP","GRANT"]', 'SELECT', 'On utilise une fonction dans une requete.', 3, 99),
                                                                    (773, 'MCQ', 'Quelle commande cree une table ?', '["CREATE TABLE","CREATE VIEW","INSERT INTO","DROP TABLE"]', 'CREATE TABLE', 'CREATE TABLE definit la table.', 1, 100),
                                                                    (774, 'MCQ', 'Quelle clause filtre les lignes ?', '["WHERE","GROUP BY","ORDER BY","LIMIT"]', 'WHERE', 'WHERE filtre les lignes.', 2, 100),
                                                                    (775, 'MCQ', 'Quelle clause regroupe les resultats ?', '["GROUP BY","ORDER BY","HAVING","DISTINCT"]', 'GROUP BY', 'GROUP BY regroupe les lignes.', 3, 100),
                                                                    (776, 'MCQ', 'Quel join garde toutes les lignes de gauche ?', '["LEFT JOIN","INNER JOIN","RIGHT JOIN","CROSS JOIN"]', 'LEFT JOIN', 'LEFT JOIN garde toutes les lignes de gauche.', 4, 100),
                                                                    (777, 'MCQ', 'Quelle commande ajoute des donnees ?', '["INSERT INTO","UPDATE","DELETE","SELECT"]', 'INSERT INTO', 'INSERT INTO ajoute des lignes.', 5, 100),
                                                                    (778, 'MCQ', 'Quelle commande modifie des lignes ?', '["UPDATE","INSERT","DELETE","SELECT"]', 'UPDATE', 'UPDATE modifie des lignes.', 6, 100),
                                                                    (779, 'MCQ', 'Quel mot valide une transaction ?', '["COMMIT","ROLLBACK","BEGIN","SAVE"]', 'COMMIT', 'COMMIT valide les changements.', 7, 100),
                                                                    (780, 'MCQ', 'Quel objet stocke une requete reutilisable ?', '["VIEW","INDEX","TRIGGER","DATABASE"]', 'VIEW', 'Une vue stocke une requete.', 8, 100),
                                                                    (781, 'MCQ', 'Quel objet stocke la cle primaire ?', '["PRIMARY KEY","FOREIGN KEY","INDEX","CHECK"]', 'PRIMARY KEY', 'PRIMARY KEY identifie chaque ligne.', 9, 100),
                                                                    (782, 'MCQ', 'Quelle commande supprime des lignes ?', '["DELETE","DROP","TRUNCATE","REMOVE"]', 'DELETE', 'DELETE supprime des lignes.', 10, 100),
                                                                    (783, 'MCQ', 'Quel type C# represente un entier ?', '["int","double","bool","char"]', 'int', 'int est le type entier de base.', 1, 101),
                                                                    (784, 'MCQ', 'Quel type stocke vrai ou faux ?', '["bool","int","string","float"]', 'bool', 'bool represente une valeur booleenne.', 2, 101),
                                                                    (785, 'MCQ', 'Quel mot-cle permet inference de type ?', '["var","auto","dynamic","let"]', 'var', 'var laisse le compilateur deduire le type.', 3, 101),
                                                                    (786, 'MCQ', 'Quelle methode affiche dans la console ?', '["Console.WriteLine","Console.ReadLine","Console.Error","print"]', 'Console.WriteLine', 'WriteLine ecrit avec saut de ligne.', 1, 102),
                                                                    (787, 'MCQ', 'Quelle methode lit une ligne ?', '["Console.ReadLine","Console.WriteLine","Console.Read","scanf"]', 'Console.ReadLine', 'ReadLine lit une ligne texte.', 2, 102),
                                                                    (788, 'MCQ', 'Console appartient a quel namespace ?', '["System","Collections","IO","Net"]', 'System', 'Console est dans System.', 3, 102),
                                                                    (789, 'MCQ', 'Quel operateur teste egalite stricte ?', '["==","=","!=","<"]', '==', '== compare deux valeurs.', 1, 103),
                                                                    (790, 'MCQ', 'Quel operateur calcule le reste ?', '["%","/","*","^"]', '%', '% donne le reste.', 2, 103),
                                                                    (791, 'MCQ', 'Quel operateur incremente de 1 ?', '["++","--","+=","**"]', '++', '++ ajoute 1.', 3, 103),
                                                                    (792, 'MCQ', 'Quel mot-cle demarre une condition ?', '["if","for","switch","case"]', 'if', 'if commence un test.', 1, 104),
                                                                    (793, 'MCQ', 'Quel mot-cle gere plusieurs cas ?', '["switch","while","break","return"]', 'switch', 'switch choisit selon une valeur.', 2, 104),
                                                                    (794, 'MCQ', 'Quel mot-cle sort d un case ?', '["break","continue","goto","return"]', 'break', 'break termine le case.', 3, 104),
                                                                    (795, 'MCQ', 'Quelle boucle est adaptee a un compteur ?', '["for","if","switch","typedef"]', 'for', 'for est ideale avec un compteur.', 1, 105),
                                                                    (796, 'MCQ', 'Quelle boucle teste avant entree ?', '["while","do-while","foreach","switch"]', 'while', 'while teste avant le bloc.', 2, 105),
                                                                    (797, 'MCQ', 'Quelle boucle parcourt une collection ?', '["foreach","for","while","switch"]', 'foreach', 'foreach parcourt chaque element.', 3, 105),
                                                                    (798, 'MCQ', 'Quel mot-cle indique aucune valeur retour ?', '["void","null","none","empty"]', 'void', 'void signifie pas de valeur retour.', 1, 106),
                                                                    (799, 'MCQ', 'Ou place-t-on le type de retour ?', '["avant le nom","apres les params","dans le corps","apres ;"]', 'avant le nom', 'Le type de retour est avant le nom.', 2, 106),
                                                                    (800, 'MCQ', 'Comment separer les parametres ?', '["avec des virgules","avec des points","avec des espaces","avec des tirets"]', 'avec des virgules', 'Les parametres sont separes par des virgules.', 3, 106),
                                                                    (801, 'MCQ', 'Quel mot-cle cree un objet ?', '["new","class","this","base"]', 'new', 'new instancie un objet.', 1, 107),
                                                                    (802, 'MCQ', 'Une classe definit ...', '["un modele","une boucle","un fichier","une interface reseau"]', 'un modele', 'Une classe est un modele d objet.', 2, 107),
                                                                    (803, 'MCQ', 'Un objet est ...', '["une instance","un package","un namespace","un type primitif"]', 'une instance', 'Un objet est une instance de classe.', 3, 107),
                                                                    (804, 'MCQ', 'Un constructeur a le meme nom que ...', '["la classe","la methode","le fichier","le namespace"]', 'la classe', 'Le constructeur porte le nom de la classe.', 1, 108),
                                                                    (805, 'MCQ', 'Les constructeurs peuvent ...', '["etre surcharges","etre herites automatiquement","etre statiques seulement","etre generiques seulement"]', 'etre surcharges', 'On peut definir plusieurs constructeurs.', 2, 108),
                                                                    (806, 'MCQ', 'Quel mot-cle appelle un autre constructeur ?', '["this","base","new","override"]', 'this', 'this() appelle un constructeur de la meme classe.', 3, 108),
                                                                    (807, 'MCQ', 'Une propriete utilise ...', '["get et set","read et write","open et close","push et pop"]', 'get et set', 'get et set definissent acces lecture/ecriture.', 1, 109),
                                                                    (808, 'MCQ', 'Exemple de propriete auto ?', '["public string Name { get; set; }","public string Name();","string Name => 0;","public string Name;"]', 'public string Name { get; set; }', 'C est une auto-propriete.', 2, 109),
                                                                    (809, 'MCQ', 'Quel modificateur limite l ecriture ?', '["private set","public set","static set","virtual set"]', 'private set', 'private set bloque l ecriture externe.', 3, 109),
                                                                    (810, 'MCQ', 'Syntaxe d heritage en C# ?', '["class B : A","class B A","B extends A","inherit B A"]', 'class B : A', ': indique l heritage.', 1, 110),
                                                                    (811, 'MCQ', 'Mot-cle pour appeler le parent ?', '["base","this","super","parent"]', 'base', 'base accede a la classe de base.', 2, 110),
                                                                    (812, 'MCQ', 'Mot-cle pour interdire l heritage ?', '["sealed","static","readonly","partial"]', 'sealed', 'sealed empeche l heritage.', 3, 110),
                                                                    (813, 'MCQ', 'Mot-cle pour definir une interface ?', '["interface","class","struct","trait"]', 'interface', 'interface declare un contrat.', 1, 111),
                                                                    (814, 'MCQ', 'Comment implementer une interface ?', '["class C : ITest","class C implements ITest","class C extends ITest","class C -> ITest"]', 'class C : ITest', 'On utilise : pour implementer.', 2, 111),
                                                                    (815, 'MCQ', 'Une classe peut implementer ...', '["plusieurs interfaces","une seule interface","aucune methode","seulement des structs"]', 'plusieurs interfaces', 'C# supporte plusieurs interfaces.', 3, 111),
                                                                    (816, 'MCQ', 'Collection dynamique de base ?', '["List<T>","Array","Tuple","Span"]', 'List<T>', 'List<T> est la liste dynamique standard.', 1, 112),
                                                                    (817, 'MCQ', 'Dictionnaire cle/valeur ?', '["Dictionary<TKey,TValue>","List<T>","Queue<T>","Stack<T>"]', 'Dictionary<TKey,TValue>', 'Dictionary stocke des paires cle/valeur.', 2, 112),
                                                                    (818, 'MCQ', 'Methode pour ajouter dans List ?', '["Add","Push","Append","InsertLast"]', 'Add', 'Add ajoute un element.', 3, 112),
                                                                    (819, 'MCQ', 'Methode LINQ pour filtrer ?', '["Where","Select","OrderBy","GroupBy"]', 'Where', 'Where filtre les elements.', 1, 113),
                                                                    (820, 'MCQ', 'Methode LINQ pour transformer ?', '["Select","Where","Take","Skip"]', 'Select', 'Select projette chaque element.', 2, 113),
                                                                    (821, 'MCQ', 'Methode LINQ pour materialiser ?', '["ToList","AsQueryable","AsEnumerable","ToArray"]', 'ToList', 'ToList cree une liste en memoire.', 3, 113),
                                                                    (822, 'MCQ', 'Bloc pour gerer erreurs ?', '["try/catch","if/else","switch","for"]', 'try/catch', 'try/catch capture les exceptions.', 1, 114),
                                                                    (823, 'MCQ', 'Mot-cle pour lancer une exception ?', '["throw","raise","panic","emit"]', 'throw', 'throw lance une exception.', 2, 114),
                                                                    (824, 'MCQ', 'Bloc execute toujours ?', '["finally","catch","try","using"]', 'finally', 'finally est execute meme en erreur.', 3, 114),
                                                                    (825, 'MCQ', 'Methode pour lire un fichier texte ?', '["File.ReadAllText","File.WriteAllText","Stream.Write","Console.ReadLine"]', 'File.ReadAllText', 'ReadAllText lit tout le fichier.', 1, 115),
                                                                    (826, 'MCQ', 'Methode pour ecrire un fichier texte ?', '["File.WriteAllText","File.ReadAllText","Console.WriteLine","Stream.Read"]', 'File.WriteAllText', 'WriteAllText ecrit tout le contenu.', 2, 115),
                                                                    (827, 'MCQ', 'Instruction utile pour liberer ressources ?', '["using","try","lock","unchecked"]', 'using', 'using dispose l objet automatiquement.', 3, 115),
                                                                    (828, 'MCQ', 'Mot-cle pour rendre une methode asynchrone ?', '["async","await","task","future"]', 'async', 'async marque la methode asynchrone.', 1, 116),
                                                                    (829, 'MCQ', 'Mot-cle pour attendre un Task ?', '["await","async","yield","sleep"]', 'await', 'await attend la completion.', 2, 116),
                                                                    (830, 'MCQ', 'Type de retour courant en async ?', '["Task","void","int","object"]', 'Task', 'Task represente une operation asynchrone.', 3, 116),
                                                                    (831, 'MCQ', 'Syntaxe pour un int nullable ?', '["int?","int!","nullable<int>","int"]', 'int?', 'Le ? rend le type nullable.', 1, 117),
                                                                    (832, 'MCQ', 'Operateur pour valeur par defaut si null ?', '["??","?:","||","&&"]', '??', '?? choisit une valeur par defaut.', 2, 117),
                                                                    (833, 'MCQ', 'Propriete qui indique presence de valeur ?', '["HasValue","IsNull","Exists","ValueType"]', 'HasValue', 'HasValue indique si la valeur est presente.', 3, 117),
                                                                    (834, 'MCQ', 'enum sert a ...', '["definir des constantes nommees","creer une classe","ouvrir un fichier","faire une boucle"]', 'definir des constantes nommees', 'enum liste des constantes.', 1, 118),
                                                                    (835, 'MCQ', 'struct est un type ...', '["valeur","reference","dynamique","interprete"]', 'valeur', 'struct est un type valeur en C#.', 2, 118),
                                                                    (836, 'MCQ', 'Type sous-jacent par defaut d un enum ?', '["int","string","byte","long"]', 'int', 'Par defaut un enum est un int.', 3, 118),
                                                                    (837, 'MCQ', 'delegate est ...', '["un type de pointeur de methode","une classe generique","un fichier","une collection"]', 'un type de pointeur de methode', 'delegate represente une signature de methode.', 1, 119),
                                                                    (838, 'MCQ', 'Mot-cle pour declarer un evenement ?', '["event","delegate","signal","notify"]', 'event', 'event declare un evenement.', 2, 119),
                                                                    (839, 'MCQ', 'Operateur pour s abonner a un event ?', '["+=","=","-=","=="]', '+=', '+= ajoute un gestionnaire.', 3, 119),
                                                                    (840, 'MCQ', 'Quelle instruction cree un objet ?', '["new","this","base","class"]', 'new', 'new instancie un objet.', 1, 120),
                                                                    (841, 'MCQ', 'Quel mot-cle marque une methode async ?', '["async","await","task","thread"]', 'async', 'async declare une methode asynchrone.', 2, 120),
                                                                    (842, 'MCQ', 'Quelle collection stocke des paires cle/valeur ?', '["Dictionary<TKey,TValue>","List<T>","Queue<T>","Stack<T>"]', 'Dictionary<TKey,TValue>', 'Dictionary est cle/valeur.', 3, 120),
                                                                    (843, 'MCQ', 'Quel operateur traite les valeurs null ?', '["??","?:","&&","||"]', '??', '?? fournit une valeur par defaut.', 4, 120),
                                                                    (844, 'MCQ', 'Quel mot-cle lance une exception ?', '["throw","raise","panic","emit"]', 'throw', 'throw lance une exception.', 5, 120),
                                                                    (845, 'MCQ', 'Quel mot-cle interdit l heritage ?', '["sealed","static","readonly","partial"]', 'sealed', 'sealed bloque l inheritance.', 6, 120),
                                                                    (846, 'MCQ', 'Quelle methode LINQ filtre ?', '["Where","Select","OrderBy","Take"]', 'Where', 'Where filtre les elements.', 7, 120),
                                                                    (847, 'MCQ', 'Quel mot-cle accede a la classe de base ?', '["base","this","super","parent"]', 'base', 'base accede au parent.', 8, 120),
                                                                    (848, 'MCQ', 'Quelle instruction lit une ligne console ?', '["Console.ReadLine","Console.WriteLine","Console.Read","ReadText"]', 'Console.ReadLine', 'ReadLine lit une ligne.', 9, 120),
                                                                    (849, 'MCQ', 'Quelle syntaxe declare une interface ?', '["interface ITest","class ITest","struct ITest","enum ITest"]', 'interface ITest', 'interface declare un contrat.', 10, 120),
                                                                    (850, 'MCQ', 'Quelle declaration indique le type de document ?', '["<!DOCTYPE html>","<doctype>","<html>","<head>"]', '<!DOCTYPE html>', 'DOCTYPE indique le type HTML5.', 1, 121),
                                                                    (851, 'MCQ', 'Quel element est la racine du document ?', '["<html>","<body>","<head>","<main>"]', '<html>', '<html> englobe tout le document.', 2, 121),
                                                                    (852, 'MCQ', 'Ou place-t-on le contenu visible ?', '["<body>","<head>","<meta>","<title>"]', '<body>', '<body> contient le contenu visible.', 3, 121),
                                                                    (853, 'MCQ', 'Balise pour un titre principal ?', '["<h1>","<p>","<strong>","<em>"]', '<h1>', '<h1> est le titre principal.', 1, 122),
                                                                    (854, 'MCQ', 'Balise pour un paragraphe ?', '["<p>","<h2>","<ul>","<span>"]', '<p>', '<p> definit un paragraphe.', 2, 122),
                                                                    (855, 'MCQ', 'Quelle balise indique une importance forte ?', '["<strong>","<em>","<i>","<b>"]', '<strong>', '<strong> marque une importance.', 3, 122),
                                                                    (856, 'MCQ', 'Balise pour un lien ?', '["<a>","<link>","<href>","<nav>"]', '<a>', '<a> cree un lien.', 1, 123),
                                                                    (857, 'MCQ', 'Quel attribut contient l URL ?', '["href","src","alt","target"]', 'href', 'href contient la destination.', 2, 123),
                                                                    (858, 'MCQ', 'Quel attribut ouvre un nouvel onglet ?', '["target=\"_blank\"","rel=\"nofollow\"","download","type"]', 'target="_blank"', '_blank ouvre un nouvel onglet.', 3, 123),
                                                                    (859, 'MCQ', 'Balise pour une image ?', '["<img>","<image>","<picture>","<src>"]', '<img>', '<img> affiche une image.', 1, 124),
                                                                    (860, 'MCQ', 'Quel attribut donne le texte alternatif ?', '["alt","title","href","id"]', 'alt', 'alt aide accessibilite et SEO.', 2, 124),
                                                                    (861, 'MCQ', 'Quel attribut pointe vers le fichier ?', '["src","href","link","file"]', 'src', 'src indique la source de l image.', 3, 124),
                                                                    (862, 'MCQ', 'Balise de liste non ordonnee ?', '["<ul>","<ol>","<li>","<dl>"]', '<ul>', '<ul> est une liste non ordonnee.', 1, 125),
                                                                    (863, 'MCQ', 'Balise de liste ordonnee ?', '["<ol>","<ul>","<li>","<dl>"]', '<ol>', '<ol> numerote les elements.', 2, 125),
                                                                    (864, 'MCQ', 'Balise pour un element de liste ?', '["<li>","<ul>","<ol>","<dd>"]', '<li>', '<li> definit un item.', 3, 125),
                                                                    (865, 'MCQ', 'Balise conteneur d un tableau ?', '["<table>","<tr>","<td>","<th>"]', '<table>', '<table> contient le tableau.', 1, 126),
                                                                    (866, 'MCQ', 'Balise pour une ligne ?', '["<tr>","<td>","<th>","<thead>"]', '<tr>', '<tr> definit une ligne.', 2, 126),
                                                                    (867, 'MCQ', 'Balise pour une cellule d en-tete ?', '["<th>","<td>","<tr>","<tfoot>"]', '<th>', '<th> est une cellule d en-tete.', 3, 126),
                                                                    (868, 'MCQ', 'Balise pour un formulaire ?', '["<form>","<input>","<fieldset>","<label>"]', '<form>', '<form> encapsule les champs.', 1, 127),
                                                                    (869, 'MCQ', 'Attribut pour l URL de soumission ?', '["action","method","name","target"]', 'action', 'action definit la destination.', 2, 127),
                                                                    (870, 'MCQ', 'Attribut pour la methode HTTP ?', '["method","action","type","enctype"]', 'method', 'method indique GET ou POST.', 3, 127),
                                                                    (871, 'MCQ', 'Type de champ pour email ?', '["email","text","url","number"]', 'email', 'type=email active la validation email.', 1, 128),
                                                                    (872, 'MCQ', 'Type de champ pour mot de passe ?', '["password","text","hidden","tel"]', 'password', 'password masque la saisie.', 2, 128),
                                                                    (873, 'MCQ', 'Type de champ a cases a cocher ?', '["checkbox","radio","range","date"]', 'checkbox', 'checkbox permet multiple selections.', 3, 128),
                                                                    (874, 'MCQ', 'Balise semantique pour en-tete ?', '["<header>","<div>","<span>","<section>"]', '<header>', '<header> represente l en-tete.', 1, 129),
                                                                    (875, 'MCQ', 'Balise pour contenu principal ?', '["<main>","<section>","<aside>","<footer>"]', '<main>', '<main> contient le contenu principal.', 2, 129),
                                                                    (876, 'MCQ', 'Balise pour navigation ?', '["<nav>","<ul>","<menu>","<header>"]', '<nav>', '<nav> definit une zone de navigation.', 3, 129),
                                                                    (877, 'MCQ', 'Balise pour audio ?', '["<audio>","<media>","<sound>","<track>"]', '<audio>', '<audio> integre un son.', 1, 130),
                                                                    (878, 'MCQ', 'Balise pour video ?', '["<video>","<movie>","<media>","<img>"]', '<video>', '<video> integre une video.', 2, 130),
                                                                    (879, 'MCQ', 'Balise pour source multiple ?', '["<source>","<src>","<file>","<track>"]', '<source>', '<source> specifie un fichier media.', 3, 130),
                                                                    (880, 'MCQ', '<div> est ...', '["un conteneur generique","un lien","un media","un titre"]', 'un conteneur generique', 'div sert a regrouper sans semantique.', 1, 131),
                                                                    (881, 'MCQ', '<section> represente ...', '["un groupe thematique","une image","un tableau","un bouton"]', 'un groupe thematique', 'section regroupe un contenu thematique.', 2, 131),
                                                                    (882, 'MCQ', 'Quelle balise est semantique ?', '["<section>","<div>","<span>","<b>"]', '<section>', 'section apporte une signification.', 3, 131),
                                                                    (883, 'MCQ', 'Balise pour definir le charset ?', '["<meta charset=\"UTF-8\">","<title>","<head>","<link>"]', '<meta charset="UTF-8">', 'meta charset definit l encodage.', 1, 132),
                                                                    (884, 'MCQ', 'Balise pour meta description ?', '["<meta name=\"description\">","<meta name=\"keywords\">","<title>","<body>"]', '<meta name="description">', 'description aide le SEO.', 2, 132),
                                                                    (885, 'MCQ', 'Meta pour le viewport ?', '["<meta name=\"viewport\">","<meta name=\"theme-color\">","<meta charset=\"UTF-8\">","<link rel=\"icon\">"]', '<meta name="viewport">', 'viewport adapte l affichage mobile.', 3, 132),
                                                                    (886, 'MCQ', 'Attribut pour texte alternatif image ?', '["alt","title","href","id"]', 'alt', 'alt est essentiel pour accessibilite.', 1, 133),
                                                                    (887, 'MCQ', 'Balise pour associer un label a un champ ?', '["<label>","<legend>","<caption>","<small>"]', '<label>', 'label lie un texte a un champ.', 2, 133),
                                                                    (888, 'MCQ', 'Attribut pour lier label et input ?', '["for","id","name","value"]', 'for', 'for doit correspondre a l id du champ.', 3, 133),
                                                                    (889, 'MCQ', 'Syntaxe d un attribut data ?', '["data-user-id","data_user_id","dataset-id","data:id"]', 'data-user-id', 'Les attributs data utilisent data-*', 1, 134),
                                                                    (890, 'MCQ', 'Ou se trouve data-* ?', '["sur n importe quel element","uniquement sur <data>","uniquement sur <meta>","uniquement sur <script>"]', 'sur n importe quel element', 'data-* est valide sur tout element.', 2, 134),
                                                                    (891, 'MCQ', 'En JS, data-* se lit via ...', '["dataset","data","attributes","meta"]', 'dataset', 'dataset expose les data-* en JS.', 3, 134),
                                                                    (892, 'MCQ', 'Balise pour integrer une page externe ?', '["<iframe>","<embed>","<object>","<link>"]', '<iframe>', 'iframe charge une page externe.', 1, 135),
                                                                    (893, 'MCQ', 'Attribut principal de iframe ?', '["src","href","data","type"]', 'src', 'src indique la page chargee.', 2, 135),
                                                                    (894, 'MCQ', 'Balise pour integrer un PDF ?', '["<embed>","<img>","<audio>","<track>"]', '<embed>', 'embed peut integrer un fichier.', 3, 135),
                                                                    (895, 'MCQ', 'Attribut pour champ obligatoire ?', '["required","pattern","min","max"]', 'required', 'required rend le champ obligatoire.', 1, 136),
                                                                    (896, 'MCQ', 'Attribut pour validation par regex ?', '["pattern","required","step","size"]', 'pattern', 'pattern valide avec une regex.', 2, 136),
                                                                    (897, 'MCQ', 'Attribut pour desactiver la validation ?', '["novalidate","disabled","readonly","hidden"]', 'novalidate', 'novalidate desactive la validation.', 3, 136),
                                                                    (898, 'MCQ', 'Balise qui definit le titre de page ?', '["<title>","<h1>","<meta>","<header>"]', '<title>', 'title apparait dans l onglet et le SEO.', 1, 137),
                                                                    (899, 'MCQ', 'Meta utile pour resume SEO ?', '["description","author","charset","viewport"]', 'description', 'description aide le SEO.', 2, 137),
                                                                    (900, 'MCQ', 'Quelle structure aide le SEO ?', '["hierarchie de titres","tables pour layout","beaucoup de <div>","texte en image"]', 'hierarchie de titres', 'Les titres bien hierarchises aident le SEO.', 3, 137),
                                                                    (901, 'MCQ', 'Quel element est inline ?', '["<span>","<div>","<section>","<p>"]', '<span>', 'span est un element inline.', 1, 138),
                                                                    (902, 'MCQ', 'Quel element est block ?', '["<div>","<span>","<a>","<em>"]', '<div>', 'div est un element block.', 2, 138),
                                                                    (903, 'MCQ', 'Un element inline commence sur une nouvelle ligne ?', '["non","oui","toujours","jamais en block"]', 'non', 'Inline ne force pas de nouvelle ligne.', 3, 138),
                                                                    (904, 'MCQ', 'Balise qui contient du contenu repliable ?', '["<details>","<summary>","<section>","<aside>"]', '<details>', 'details cree une zone repliable.', 1, 139),
                                                                    (905, 'MCQ', 'Balise pour le titre de details ?', '["<summary>","<title>","<header>","<caption>"]', '<summary>', 'summary definit le titre visible.', 2, 139),
                                                                    (906, 'MCQ', 'details ouvert par defaut ?', '["attribut open","class open","id open","style open"]', 'attribut open', 'open ouvre la zone au chargement.', 3, 139),
                                                                    (907, 'MCQ', 'Quelle balise cree un lien ?', '["<a>","<link>","<href>","<nav>"]', '<a>', '<a> cree un lien.', 1, 140),
                                                                    (908, 'MCQ', 'Quel attribut est obligatoire pour une image ?', '["src","href","title","id"]', 'src', 'src pointe vers le fichier image.', 2, 140),
                                                                    (909, 'MCQ', 'Quelle balise est semantique pour navigation ?', '["<nav>","<div>","<span>","<section>"]', '<nav>', 'nav represente la navigation.', 3, 140),
                                                                    (910, 'MCQ', 'Quelle balise ajoute une legende a un tableau ?', '["<caption>","<legend>","<summary>","<header>"]', '<caption>', 'caption ajoute une legende au tableau.', 4, 140),
                                                                    (911, 'MCQ', 'Quel attribut rend un champ obligatoire ?', '["required","pattern","min","max"]', 'required', 'required impose une saisie.', 5, 140),
                                                                    (912, 'MCQ', 'Quelle balise definit un tableau ?', '["<table>","<tr>","<td>","<th>"]', '<table>', 'table contient les lignes et cellules.', 6, 140),
                                                                    (913, 'MCQ', 'Quel tag definit le titre principal ?', '["<h1>","<p>","<strong>","<em>"]', '<h1>', 'h1 est le titre principal.', 7, 140),
                                                                    (914, 'MCQ', 'Quel attribut indique la langue du document ?', '["lang","dir","charset","name"]', 'lang', 'lang indique la langue de la page.', 8, 140),
                                                                    (915, 'MCQ', 'Quel element contient le contenu visible ?', '["<body>","<head>","<meta>","<title>"]', '<body>', 'body contient le contenu visible.', 9, 140),
                                                                    (916, 'MCQ', 'Quel element decrit une zone thematique ?', '["<section>","<span>","<b>","<i>"]', '<section>', 'section est une zone thematique.', 10, 140),
                                                                    (917, 'MCQ', 'Selecteur pour une classe ?', '[".btn","#btn","btn","*"]', '.btn', 'Le point cible une classe.', 1, 141),
                                                                    (918, 'MCQ', 'Selecteur pour un id ?', '["#main",".main","main","*"]', '#main', 'Le diÃ¨se cible un id.', 2, 141),
                                                                    (919, 'MCQ', 'Selecteur de groupe valide ?', '["h1, h2","h1 h2","h1 > h2","h1 + h2"]', 'h1, h2', 'La virgule groupe plusieurs elements.', 3, 141),
                                                                    (920, 'MCQ', 'Ordre du box model du centre vers l exterieur ?', '["content, padding, border, margin","padding, content, margin, border","content, border, padding, margin","margin, border, padding, content"]', 'content, padding, border, margin', 'Le box model part du contenu vers la marge.', 1, 142),
                                                                    (921, 'MCQ', 'Quelle propriete inclut border dans la taille ?', '["box-sizing: border-box","box-sizing: content-box","display: block","overflow: hidden"]', 'box-sizing: border-box', 'border-box inclut padding et border.', 2, 142),
                                                                    (922, 'MCQ', 'Padding correspond a ...', '["l espace interne","l espace externe","la bordure","la hauteur"]', 'l espace interne', 'Padding est l espace a l interieur de la bordure.', 3, 142),
                                                                    (923, 'MCQ', 'Format hex pour rouge ?', '["#ff0000","#00ff00","#0000ff","#ffffff"]', '#ff0000', 'Le rouge pur est #ff0000.', 1, 143),
                                                                    (924, 'MCQ', 'Unite relative a la racine ?', '["rem","px","pt","cm"]', 'rem', 'rem se base sur la taille racine.', 2, 143),
                                                                    (925, 'MCQ', 'Quelle notation supporte la transparence ?', '["rgba(0,0,0,0.5)","rgb(0,0,0)","#000","hsl(0,0,0)"]', 'rgba(0,0,0,0.5)', 'rgba ajoute un canal alpha.', 3, 143),
                                                                    (926, 'MCQ', 'Propriete pour choisir la police ?', '["font-family","font-size","font-style","line-height"]', 'font-family', 'font-family indique la police.', 1, 144),
                                                                    (927, 'MCQ', 'Propriete pour la taille du texte ?', '["font-size","font-weight","font-variant","text-align"]', 'font-size', 'font-size definit la taille.', 2, 144),
                                                                    (928, 'MCQ', 'Propriete pour l epaisseur ?', '["font-weight","font-style","letter-spacing","word-spacing"]', 'font-weight', 'font-weight controle l epaisseur.', 3, 144),
                                                                    (929, 'MCQ', 'Quelle valeur active Flexbox ?', '["display: flex","display: grid","position: flex","float: flex"]', 'display: flex', 'display: flex active Flexbox.', 1, 145),
                                                                    (930, 'MCQ', 'Aligner sur l axe principal ?', '["justify-content","align-items","align-content","flex-wrap"]', 'justify-content', 'justify-content gere l axe principal.', 2, 145),
                                                                    (931, 'MCQ', 'Aligner sur l axe secondaire ?', '["align-items","justify-content","flex-basis","order"]', 'align-items', 'align-items gere l axe secondaire.', 3, 145),
                                                                    (932, 'MCQ', 'Quelle valeur active Grid ?', '["display: grid","display: flex","position: grid","float: grid"]', 'display: grid', 'display: grid active CSS Grid.', 1, 146),
                                                                    (933, 'MCQ', 'Definir les colonnes ?', '["grid-template-columns","grid-template-rows","grid-auto-flow","grid-gap"]', 'grid-template-columns', 'grid-template-columns fixe la grille.', 2, 146),
                                                                    (934, 'MCQ', 'Espace entre lignes et colonnes ?', '["gap","margin","padding","border"]', 'gap', 'gap definit l espace entre pistes.', 3, 146),
                                                                    (935, 'MCQ', 'Position relative signifie ...', '["decale par rapport a sa position initiale","fixe par rapport au viewport","retire du flux","aligne au parent"]', 'decale par rapport a sa position initiale', 'relative conserve l espace dans le flux.', 1, 147),
                                                                    (936, 'MCQ', 'Position absolute se place par rapport ...', '["au parent positionne","au viewport","au voisin","au body toujours"]', 'au parent positionne', 'absolute se base sur le premier parent positionne.', 2, 147),
                                                                    (937, 'MCQ', 'Position fixe colle a ...', '["au viewport","au parent","au flux","au contenu"]', 'au viewport', 'fixed reste fixe dans la fenetre.', 3, 147),
                                                                    (938, 'MCQ', 'display: none fait ...', '["disparaitre et retirer du flux","juste masquer","rendre transparent","fixer en haut"]', 'disparaitre et retirer du flux', 'display: none retire l element du flux.', 1, 148),
                                                                    (939, 'MCQ', 'visibility: hidden fait ...', '["masquer mais garder l espace","retirer du flux","rendre invisible et cliquable","forcer le block"]', 'masquer mais garder l espace', 'visibility: hidden conserve l espace.', 2, 148),
                                                                    (940, 'MCQ', 'opacity: 0 rend l element ...', '["invisible mais present","retire du flux","impossible a cliquer","visible"]', 'invisible mais present', 'opacity ne retire pas l element.', 3, 148),
                                                                    (941, 'MCQ', 'Propriete pour couleur de fond ?', '["background-color","color","border-color","fill"]', 'background-color', 'background-color definit la couleur de fond.', 1, 149),
                                                                    (942, 'MCQ', 'Propriete pour image de fond ?', '["background-image","background-color","background","image"]', 'background-image', 'background-image charge une image.', 2, 149),
                                                                    (943, 'MCQ', 'Valeur pour couvrir tout le conteneur ?', '["background-size: cover","background-size: contain","background-repeat: repeat","background-position: center"]', 'background-size: cover', 'cover remplit le conteneur.', 3, 149),
                                                                    (944, 'MCQ', 'Propriete pour definir une bordure ?', '["border","outline","box-shadow","stroke"]', 'border', 'border definit la bordure.', 1, 150),
                                                                    (945, 'MCQ', 'Propriete pour arrondir les coins ?', '["border-radius","border-style","radius","corner"]', 'border-radius', 'border-radius arrondit les coins.', 2, 150),
                                                                    (946, 'MCQ', 'Propriete pour l ombre d une boite ?', '["box-shadow","text-shadow","filter","outline"]', 'box-shadow', 'box-shadow ajoute une ombre.', 3, 150),
                                                                    (947, 'MCQ', 'Propriete pour declarer une transition ?', '["transition","animation","transform","filter"]', 'transition', 'transition anime un changement.', 1, 151),
                                                                    (948, 'MCQ', 'Propriete pour la duree ?', '["transition-duration","transition-delay","transition-timing-function","duration"]', 'transition-duration', 'transition-duration fixe la duree.', 2, 151),
                                                                    (949, 'MCQ', 'Propriete pour cibler une propriete ?', '["transition-property","transition-duration","transition-delay","transition"]', 'transition-property', 'transition-property choisit la propriete cible.', 3, 151),
                                                                    (950, 'MCQ', 'Fonction pour deplacer un element ?', '["translate","rotate","scale","skew"]', 'translate', 'translate deplace un element.', 1, 152),
                                                                    (951, 'MCQ', 'Fonction pour tourner un element ?', '["rotate","translate","scale","skew"]', 'rotate', 'rotate tourne un element.', 2, 152),
                                                                    (952, 'MCQ', 'Fonction pour agrandir/reduire ?', '["scale","rotate","translate","skew"]', 'scale', 'scale modifie la taille.', 3, 152),
                                                                    (953, 'MCQ', 'Regle pour media query ?', '["@media","@screen","@responsive","@query"]', '@media', '@media definit des regles conditionnelles.', 1, 153),
                                                                    (954, 'MCQ', 'Condition pour ecran petit ?', '["max-width: 600px","min-width: 600px","max-height: 600px","min-height: 600px"]', 'max-width: 600px', 'max-width cible les petits ecrans.', 2, 153),
                                                                    (955, 'MCQ', 'Approche mobile-first utilise ...', '["min-width","max-width","width","height"]', 'min-width', 'mobile-first ajoute des regles a partir de min-width.', 3, 153),
                                                                    (956, 'MCQ', 'Pseudo-classe au survol ?', '[":hover",":focus","::before",":active"]', ':hover', ':hover s applique au survol.', 1, 154),
                                                                    (957, 'MCQ', 'Pseudo-classe au focus ?', '[":focus",":hover",":checked",":visited"]', ':focus', ':focus s applique au focus.', 2, 154),
                                                                    (958, 'MCQ', 'Pseudo-classe pour un element pair ?', '[":nth-child(2n)",":first-line","::after",":root"]', ':nth-child(2n)', 'nth-child selectionne des positions.', 3, 154),
                                                                    (959, 'MCQ', 'Pseudo-element pour ajouter avant ?', '["::before",":before",":hover","::after"]', '::before', '::before ajoute du contenu avant.', 1, 155),
                                                                    (960, 'MCQ', 'Pseudo-element pour ajouter apres ?', '["::after",":after",":active","::before"]', '::after', '::after ajoute du contenu apres.', 2, 155),
                                                                    (961, 'MCQ', 'Quelle propriete est requise avec ::before ?', '["content","display","position","color"]', 'content', 'content est necessaire pour afficher le pseudo-element.', 3, 155),
                                                                    (962, 'MCQ', 'Syntaxe pour definir une variable CSS ?', '["--main-color","var-main","$main","@main"]', '--main-color', 'Les variables CSS commencent par --.', 1, 156),
                                                                    (963, 'MCQ', 'Syntaxe pour utiliser une variable ?', '["var(--main-color)","use(--main-color)","$main-color","get(--main-color)"]', 'var(--main-color)', 'var() lit une variable CSS.', 2, 156),
                                                                    (964, 'MCQ', 'Ou definir une variable globale ?', '[":root","body","*","html body"]', ':root', ':root est souvent utilise pour les variables globales.', 3, 156),
                                                                    (965, 'MCQ', 'Regle pour definir des keyframes ?', '["@keyframes","@animation","@frames","@animate"]', '@keyframes', '@keyframes definit une animation.', 1, 157),
                                                                    (966, 'MCQ', 'Propriete pour le nom d animation ?', '["animation-name","animation-duration","animation-delay","animation"]', 'animation-name', 'animation-name choisit la sequence.', 2, 157),
                                                                    (967, 'MCQ', 'Propriete pour la duree d animation ?', '["animation-duration","animation-name","animation-delay","duration"]', 'animation-duration', 'animation-duration fixe la duree.', 3, 157),
                                                                    (968, 'MCQ', 'z-index fonctionne seulement si l element est ...', '["positionne","en display inline","sans taille","en float"]', 'positionne', 'z-index requiert position autre que static.', 1, 158),
                                                                    (969, 'MCQ', 'Valeur z-index plus grande ...', '["passe devant","passe derriere","ne change rien","cache le parent"]', 'passe devant', 'Plus grand signifie plus haut dans la pile.', 2, 158),
                                                                    (970, 'MCQ', 'z-index cree un ordre dans ...', '["la pile de rendu","la police","le DOM","les media queries"]', 'la pile de rendu', 'z-index affecte l ordre de superposition.', 3, 158),
                                                                    (971, 'MCQ', 'overflow: hidden fait ...', '["masquer le debordement","ajouter un scroll","etirer la boite","changer la couleur"]', 'masquer le debordement', 'hidden coupe le contenu qui depasse.', 1, 159),
                                                                    (972, 'MCQ', 'overflow: scroll fait ...', '["afficher des barres de defilement","masquer le contenu","agrandir la boite","rendre inline"]', 'afficher des barres de defilement', 'scroll force les barres.', 2, 159),
                                                                    (973, 'MCQ', 'Propriete pour controler horizontalement ?', '["overflow-x","overflow-y","overflow-z","flow"]', 'overflow-x', 'overflow-x gere le debordement horizontal.', 3, 159),
                                                                    (974, 'MCQ', 'Quel selecteur est le plus specifique ?', '["#id",".class","div","*"]', '#id', 'Un id est plus specifique qu une classe.', 1, 160),
                                                                    (975, 'MCQ', 'Quel style a la priorite la plus haute ?', '["style inline","regle de classe","regle element","herite"]', 'style inline', 'Inline est le plus specifique.', 2, 160),
                                                                    (976, 'MCQ', 'Quel mot-cle force une regle ?', '["!important","!override","!force","!top"]', '!important', '!important surpasse la cascade.', 3, 160),
                                                                    (1044, 'MCQ', 'Quelle declaration cible un element avec id menu ?', '["#menu",".menu","menu","#.menu"]', '#menu', 'Le selecteur #id cible un element par son id.', 4, 160),
                                                                    (1045, 'MCQ', 'Quelle declaration cible tous les elements avec la classe card ?', '[".card","#card","card","*card"]', '.card', 'Le selecteur .classe cible tous les elements ayant cette classe.', 5, 160),
                                                                    (1046, 'MCQ', 'Quelle source de style est appliquee en dernier a specificite egale ?', '["La regle definie plus bas","La regle definie plus haut","La premiere regle chargee","Aucune regle"]', 'La regle definie plus bas', 'A specificite egale, la derniere declaration gagne.', 6, 160),
                                                                    (1047, 'MCQ', 'Quelle declaration combine classe et pseudo-classe hover ?', '[".btn:hover",".btn::hover","#btn:hover","hover(.btn)"]', '.btn:hover', 'La syntaxe standard est .classe:hover.', 7, 160),
                                                                    (1048, 'MCQ', 'Quel selecteur est le plus specifique entre .nav li a et #nav a ?', '["#nav a",".nav li a","li a","a"]', '#nav a', 'Un selecteur contenant un id reste plus specifique.', 8, 160),
                                                                    (1049, 'MCQ', 'Quelle ecriture est correcte pour appliquer !important ?', '["color: red !important;","color: !important red;","!important color: red;","color: red important;"]', 'color: red !important;', '!important se place apres la valeur de la propriete.', 9, 160),
                                                                    (1050, 'MCQ', 'Quel selecteur universel correspond a tous les elements ?', '["*",".*","#*","all"]', '*', 'Le selecteur * cible tous les elements.', 10, 160),
                                                                    (977, 'MCQ', 'Mot-cle pour variable modifiable ?', '["let","const","var","static"]', 'let', 'let declare une variable modifiable.', 1, 161),
                                                                    (978, 'MCQ', 'Mot-cle pour constante ?', '["const","let","var","final"]', 'const', 'const bloque la reassignment.', 2, 161),
                                                                    (979, 'MCQ', 'Portee de var est ...', '["fonction","bloc","module","classe"]', 'fonction', 'var est scopee a la fonction.', 3, 161),
                                                                    (980, 'MCQ', 'typeof 42 retourne ...', '["number","string","object","boolean"]', 'number', '42 est un nombre.', 1, 162),
                                                                    (981, 'MCQ', 'typeof ''hi'' retourne ...', '["string","number","object","boolean"]', 'string', 'Une chaine est de type string.', 2, 162),
                                                                    (982, 'MCQ', 'typeof null retourne ...', '["object","null","undefined","number"]', 'object', 'C est un piege connu en JS.', 3, 162),
                                                                    (983, 'MCQ', 'Operateur d egalite stricte ?', '["===","==","!=","<"]', '===', '=== compare valeur et type.', 1, 163),
                                                                    (984, 'MCQ', 'Operateur logique ET ?', '["&&","||","!","??"]', '&&', '&& est le ET logique.', 2, 163),
                                                                    (985, 'MCQ', 'Operateur de concatenation ?', '["+","*","/","%"]', '+', '+ concatene des chaines.', 3, 163),
                                                                    (986, 'MCQ', 'Mot-cle pour condition ?', '["if","for","switch","case"]', 'if', 'if demarre une condition.', 1, 164),
                                                                    (987, 'MCQ', 'Mot-cle pour choix multiple ?', '["switch","if","for","try"]', 'switch', 'switch gere plusieurs cas.', 2, 164),
                                                                    (988, 'MCQ', 'Operateur ternaire utilise ...', '["? :","??","&&","||"]', '? :', 'Le ternaire a la forme condition ? a : b.', 3, 164),
                                                                    (989, 'MCQ', 'Boucle classique avec compteur ?', '["for","while","for...of","switch"]', 'for', 'for est la boucle a compteur.', 1, 165),
                                                                    (990, 'MCQ', 'Boucle qui teste avant entree ?', '["while","do...while","for...in","switch"]', 'while', 'while teste avant d entrer.', 2, 165),
                                                                    (991, 'MCQ', 'Boucle pour parcourir un tableau ?', '["for...of","for...in","switch","try"]', 'for...of', 'for...of parcourt les valeurs.', 3, 165),
                                                                    (992, 'MCQ', 'Declaration de fonction classique ?', '["function add(a,b){}","def add(a,b)","add => (a,b)","func add()"]', 'function add(a,b){}', 'function declare une fonction.', 1, 166),
                                                                    (993, 'MCQ', 'Syntaxe de fonction flechee ?', '["(a)=>a+1","function(a)=>a+1","a->a+1","lambda a"]', '(a)=>a+1', '=> est la syntaxe flechee.', 2, 166),
                                                                    (994, 'MCQ', 'Mot-cle pour renvoyer une valeur ?', '["return","yield","break","throw"]', 'return', 'return renvoie une valeur.', 3, 166),
                                                                    (995, 'MCQ', 'Methode pour ajouter un element ?', '["push","add","append","insert"]', 'push', 'push ajoute en fin de tableau.', 1, 167),
                                                                    (996, 'MCQ', 'Propriete pour la taille ?', '["length","size","count","len"]', 'length', 'length donne la taille du tableau.', 2, 167),
                                                                    (997, 'MCQ', 'Methode pour transformer un tableau ?', '["map","forEach","push","pop"]', 'map', 'map cree un nouveau tableau.', 3, 167),
                                                                    (998, 'MCQ', 'Syntaxe d objet litteral ?', '["{a:1}","[a:1]","(a:1)","<a:1>"]', '{a:1}', 'Les objets utilisent des accolades.', 1, 168),
                                                                    (999, 'MCQ', 'Acces a une propriete ?', '["obj.name","obj->name","obj[name]","obj::name"]', 'obj.name', 'Le point accede a une propriete.', 2, 168),
                                                                    (1000, 'MCQ', 'Mot-cle pour creer un objet a partir d une classe ?', '["new","class","this","base"]', 'new', 'new instancie un objet.', 3, 168),
                                                                    (1001, 'MCQ', 'Selection par selecteur CSS ?', '["document.querySelector","document.getElement","document.select","document.pick"]', 'document.querySelector', 'querySelector utilise un selecteur CSS.', 1, 169),
                                                                    (1002, 'MCQ', 'Selection par id ?', '["document.getElementById","document.querySelectorAll","document.getElementsByClass","document.find"]', 'document.getElementById', 'getElementById selectionne par id.', 2, 169),
                                                                    (1003, 'MCQ', 'Selection de plusieurs elements ?', '["document.querySelectorAll","document.getElementById","document.firstChild","document.find"]', 'document.querySelectorAll', 'querySelectorAll retourne une liste.', 3, 169),
                                                                    (1004, 'MCQ', 'Methode pour ecouter un event ?', '["addEventListener","onEvent","listen","attach"]', 'addEventListener', 'addEventListener attache un listener.', 1, 170),
                                                                    (1005, 'MCQ', 'Event de clic ?', '["click","press","tap","mouse"]', 'click', 'click est declenche au clic.', 2, 170),
                                                                    (1006, 'MCQ', 'Pour empecher un formulaire de soumettre ?', '["event.preventDefault()","event.stop()","event.block()","return false"]', 'event.preventDefault()', 'preventDefault annule le comportement par defaut.', 3, 170),
                                                                    (1007, 'MCQ', 'API pour requetes HTTP modernes ?', '["fetch","ajax","http","request"]', 'fetch', 'fetch est l API standard moderne.', 1, 171),
                                                                    (1008, 'MCQ', 'Quelle methode convertit en JSON ?', '["response.json()","response.text()","JSON.parse()","toJson()"]', 'response.json()', 'response.json() lit le corps en JSON.', 2, 171),
                                                                    (1009, 'MCQ', 'fetch retourne ...', '["une Promise","un objet direct","un tableau","un bool"]', 'une Promise', 'fetch est asynchrone.', 3, 171),
                                                                    (1010, 'MCQ', 'Un Promise peut etre ...', '["resolvee ou rejectee","toujours resolue","toujours rejetee","synchrone"]', 'resolvee ou rejectee', 'Une Promise a deux etats finaux.', 1, 172),
                                                                    (1011, 'MCQ', 'Mot-cle pour attendre une Promise ?', '["await","async","then","catch"]', 'await', 'await attend la Promise.', 2, 172),
                                                                    (1012, 'MCQ', 'Bloc pour gerer erreurs async ?', '["try/catch","if/else","switch","for"]', 'try/catch', 'try/catch capture les erreurs async.', 3, 172),
                                                                    (1013, 'MCQ', 'Mot-cle pour exporter ?', '["export","module","public","provide"]', 'export', 'export expose un element.', 1, 173),
                                                                    (1014, 'MCQ', 'Mot-cle pour importer ?', '["import","require","include","use"]', 'import', 'import charge un module.', 2, 173),
                                                                    (1015, 'MCQ', 'Export par defaut utilise ...', '["export default","export main","default export","module export"]', 'export default', 'export default definit un export principal.', 3, 173),
                                                                    (1016, 'MCQ', 'Mot-cle pour lancer une erreur ?', '["throw","raise","panic","emit"]', 'throw', 'throw lance une exception.', 1, 174),
                                                                    (1017, 'MCQ', 'Objet d erreur standard ?', '["Error","Exception","Fault","Throwable"]', 'Error', 'Error est l objet standard.', 2, 174),
                                                                    (1018, 'MCQ', 'Bloc pour attraper une erreur ?', '["catch","then","finally","else"]', 'catch', 'catch intercepte l erreur.', 3, 174),
                                                                    (1019, 'MCQ', 'Stockage cle/valeur du navigateur ?', '["localStorage","session","cookie","cache"]', 'localStorage', 'localStorage conserve les donnees.', 1, 175),
                                                                    (1020, 'MCQ', 'Methode pour enregistrer ?', '["setItem","add","save","store"]', 'setItem', 'setItem ecrit une valeur.', 2, 175),
                                                                    (1021, 'MCQ', 'Methode pour lire ?', '["getItem","read","fetch","load"]', 'getItem', 'getItem lit une valeur.', 3, 175),
                                                                    (1022, 'MCQ', 'Destructuring d objet ?', '["const {a} = obj","const a = obj","const [a] = obj","const (a) = obj"]', 'const {a} = obj', 'On extrait des proprietes par nom.', 1, 176),
                                                                    (1023, 'MCQ', 'Destructuring de tableau ?', '["const [a,b] = arr","const {a,b} = arr","const (a,b) = arr","const a = arr"]', 'const [a,b] = arr', 'On extrait par position.', 2, 176),
                                                                    (1024, 'MCQ', 'Destructuring avec valeur par defaut ?', '["const {a=1} = obj","const {a:1} = obj","const {a} = 1","const a=1 = obj"]', 'const {a=1} = obj', 'On peut definir une valeur par defaut.', 3, 176),
                                                                    (1025, 'MCQ', 'Mot-cle pour definir une classe ?', '["class","function","object","type"]', 'class', 'class declare une classe.', 1, 177),
                                                                    (1026, 'MCQ', 'Nom du constructeur ?', '["constructor","init","new","build"]', 'constructor', 'constructor initialise l objet.', 2, 177),
                                                                    (1027, 'MCQ', 'Mot-cle pour heriter ?', '["extends","implements","inherits","with"]', 'extends', 'extends herite d une classe.', 3, 177),
                                                                    (1028, 'MCQ', 'Methode pour convertir en objet ?', '["JSON.parse","JSON.stringify","toJSON","parseJSON"]', 'JSON.parse', 'JSON.parse lit une chaine JSON.', 1, 178),
                                                                    (1029, 'MCQ', 'Methode pour convertir en chaine ?', '["JSON.stringify","JSON.parse","toString","stringifyJSON"]', 'JSON.stringify', 'JSON.stringify produit une chaine JSON.', 2, 178),
                                                                    (1030, 'MCQ', 'JSON valide utilise ...', '["des guillemets doubles","des guillemets simples","des commentaires","des fonctions"]', 'des guillemets doubles', 'JSON impose les guillemets doubles.', 3, 178),
                                                                    (1031, 'MCQ', 'Creer une date courante ?', '["new Date()","Date.now()","Date()","getDate()"]', 'new Date()', 'new Date() cree un objet Date.', 1, 179),
                                                                    (1032, 'MCQ', 'Obtenir l annee courante ?', '["getFullYear()","getYear()","year()","fullYear"]', 'getFullYear()', 'getFullYear renvoie l annee.', 2, 179),
                                                                    (1033, 'MCQ', 'Format ISO d une date ?', '["toISOString()","toString()","toUTC()","formatISO()"]', 'toISOString()', 'toISOString renvoie une chaine ISO.', 3, 179),
                                                                    (1034, 'MCQ', 'Quelle instruction declare une constante ?', '["const","let","var","static"]', 'const', 'const declare une constante.', 1, 180),
                                                                    (1035, 'MCQ', 'Quel operateur compare type et valeur ?', '["===","==","!=","<"]', '===', '=== compare type et valeur.', 2, 180),
                                                                    (1036, 'MCQ', 'Quelle methode ajoute en fin de tableau ?', '["push","pop","shift","unshift"]', 'push', 'push ajoute en fin de tableau.', 3, 180),
                                                                    (1037, 'MCQ', 'Quelle API fait une requete HTTP ?', '["fetch","query","request","http"]', 'fetch', 'fetch fait une requete HTTP.', 4, 180),
                                                                    (1038, 'MCQ', 'Quelle methode parse du JSON ?', '["JSON.parse","JSON.stringify","toJSON","parseJSON"]', 'JSON.parse', 'JSON.parse transforme une chaine JSON.', 5, 180),
                                                                    (1039, 'MCQ', 'Quel mot-cle ecoute un evenement ?', '["addEventListener","onEvent","listen","attach"]', 'addEventListener', 'addEventListener attache un listener.', 6, 180),
                                                                    (1040, 'MCQ', 'Quel mot-cle rend une fonction asynchrone ?', '["async","await","then","promise"]', 'async', 'async declare une fonction asynchrone.', 7, 180),
                                                                    (1041, 'MCQ', 'Quel mot-cle importe un module ?', '["import","export","require","include"]', 'import', 'import charge un module.', 8, 180),
                                                                    (1042, 'MCQ', 'Quel stockage persistant navigateur ?', '["localStorage","session","cookie","cache"]', 'localStorage', 'localStorage conserve les donnees.', 9, 180),
                                                                    (1043, 'MCQ', 'Quel mot-cle cree une classe ?', '["class","function","object","type"]', 'class', 'class declare une classe.', 10, 180),
                                                                    (1051, 'MCQ', 'Quel mot cle alloue dynamiquement en C++ ?', '["malloc","new","alloc","create"]', 'new', 'new alloue et appelle le constructeur.', 11, 80),
                                                                    (1052, 'MCQ', 'Quel mot cle libere une allocation faite avec new ?', '["free","delete","destroy","remove"]', 'delete', 'delete libere une allocation creee avec new.', 12, 80),
                                                                    (1053, 'MCQ', 'Quel conteneur STL stocke des elements dynamiques contigus ?', '["vector","map","set","queue"]', 'vector', 'vector stocke les elements dans une zone contigue.', 13, 80),
                                                                    (1054, 'MCQ', 'Quel operateur permet d acceder a un membre via un pointeur ?', '[".","->","::","*"]', '->', '-> accede a un membre via un pointeur.', 14, 80),
                                                                    (1055, 'MCQ', 'Quel mot cle designe le namespace standard ?', '["std","global","core","main"]', 'std', 'std est le namespace standard de C++.', 15, 80),
                                                                    (1056, 'MCQ', 'Quelle clause trie les resultats ?', '["ORDER BY","GROUP BY","HAVING","LIMIT"]', 'ORDER BY', 'ORDER BY trie les lignes du resultat.', 11, 100),
                                                                    (1057, 'MCQ', 'Quelle clause limite le nombre de lignes retournees ?', '["LIMIT","WHERE","JOIN","OFFSET"]', 'LIMIT', 'LIMIT limite le nombre de lignes renvoyees.', 12, 100),
                                                                    (1058, 'MCQ', 'Quelle fonction compte les lignes ?', '["COUNT(*)","SUM(*)","LEN(*)","TOTAL(*)"]', 'COUNT(*)', 'COUNT(*) compte les lignes.', 13, 100),
                                                                    (1059, 'MCQ', 'Quel type de jointure conserve toutes les lignes de la table gauche ?', '["LEFT JOIN","INNER JOIN","RIGHT JOIN","CROSS JOIN"]', 'LEFT JOIN', 'LEFT JOIN conserve toutes les lignes de gauche.', 14, 100),
                                                                    (1060, 'MCQ', 'Quelle commande supprime toutes les lignes sans supprimer la table ?', '["TRUNCATE","DROP TABLE","DELETE TABLE","REMOVE"]', 'TRUNCATE', 'TRUNCATE vide la table sans supprimer sa structure.', 15, 100),
                                                                    (1061, 'MCQ', 'Quel mot cle declare une classe en C# ?', '["class","struct","record","object"]', 'class', 'class declare une classe.', 11, 120),
                                                                    (1062, 'MCQ', 'Quel type est utilise pour une chaine en C# ?', '["string","char[]","text","varchar"]', 'string', 'string represente une chaine de caracteres.', 12, 120),
                                                                    (1063, 'MCQ', 'Quel mot cle capture une exception ?', '["catch","throw","finally","fault"]', 'catch', 'catch intercepte les exceptions.', 13, 120),
                                                                    (1064, 'MCQ', 'Quel framework mappe objets et base de donnees en .NET ?', '["Entity Framework","NUnit","Serilog","xUnit"]', 'Entity Framework', 'Entity Framework sert de couche ORM.', 14, 120),
                                                                    (1065, 'MCQ', 'Quelle methode LINQ projette chaque element ?', '["Select","Where","GroupBy","OrderBy"]', 'Select', 'Select transforme chaque element.', 15, 120),
                                                                    (1066, 'MCQ', 'Quelle balise definit une image ?', '["<img>","<image>","<pic>","<media>"]', '<img>', 'La balise <img> insere une image.', 11, 140),
                                                                    (1067, 'MCQ', 'Quelle balise cree un lien hypertexte ?', '["<a>","<link>","<href>","<url>"]', '<a>', 'La balise <a> cree un lien.', 12, 140),
                                                                    (1068, 'MCQ', 'Quel attribut est recommande pour l accessibilite de <img> ?', '["alt","srcset","target","rel"]', 'alt', 'alt fournit un texte alternatif.', 13, 140),
                                                                    (1069, 'MCQ', 'Quelle balise represente un paragraphe ?', '["<p>","<text>","<para>","<section>"]', '<p>', '<p> represente un paragraphe.', 14, 140),
                                                                    (1070, 'MCQ', 'Quelle balise contient le titre de onglet navigateur ?', '["<title>","<h1>","<meta>","<header>"]', '<title>', 'Le titre de page est dans <title>.', 15, 140),
                                                                    (1071, 'MCQ', 'Quelle propriete change la couleur du texte ?', '["color","background-color","font-style","border-color"]', 'color', 'color applique la couleur du texte.', 11, 160),
                                                                    (1072, 'MCQ', 'Quelle propriete definit la taille du texte ?', '["font-size","line-height","font-weight","text-size"]', 'font-size', 'font-size controle la taille de la police.', 12, 160),
                                                                    (1073, 'MCQ', 'Quelle valeur retire un element du flux et le fixe au viewport ?', '["fixed","relative","static","inherit"]', 'fixed', 'position: fixed est relatif au viewport.', 13, 160),
                                                                    (1074, 'MCQ', 'Quelle unite est relative a la taille de police du parent ?', '["em","px","vw","cm"]', 'em', 'em depend de la taille de police du parent.', 14, 160),
                                                                    (1075, 'MCQ', 'Quelle propriete ajoute un espacement interne ?', '["padding","margin","gap","outline"]', 'padding', 'padding ajoute un espacement interne.', 15, 160),
                                                                    (1076, 'MCQ', 'Quelle methode transforme une chaine JSON en objet JS ?', '["JSON.parse","JSON.stringify","Object.parse","toJSON"]', 'JSON.parse', 'JSON.parse convertit une chaine JSON en objet.', 11, 180),
                                                                    (1077, 'MCQ', 'Quelle methode transforme un objet JS en chaine JSON ?', '["JSON.stringify","JSON.parse","Object.stringify","encodeJSON"]', 'JSON.stringify', 'JSON.stringify convertit un objet en JSON texte.', 12, 180),
                                                                    (1078, 'MCQ', 'Quelle methode retourne le premier element pour un selecteur CSS ?', '["querySelector","getElementById","querySelectorAll","find"]', 'querySelector', 'querySelector retourne le premier match.', 13, 180),
                                                                    (1079, 'MCQ', 'Quelle boucle parcourt les valeurs d un tableau ?', '["for...of","for...in","while","switch"]', 'for...of', 'for...of parcourt les valeurs du tableau.', 14, 180),
                                                                    (1080, 'MCQ', 'Quel mot cle interrompt une boucle ?', '["break","continue","return","exit"]', 'break', 'break arrete la boucle en cours.', 15, 180);


-- Dev admin account (password: Admin@123)
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@unicode.local', '$2b$10$l8fSvpu7EYRbSoHSXKSJ7.w9aVO8UTihfLXObGMqEppsUZ3Mu4GQy', 'ADMIN');
