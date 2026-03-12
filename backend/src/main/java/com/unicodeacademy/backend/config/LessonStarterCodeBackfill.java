package com.unicodeacademy.backend.config;

import com.unicodeacademy.backend.model.Lesson;
import com.unicodeacademy.backend.repository.LessonRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Order(1000)
public class LessonStarterCodeBackfill implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(LessonStarterCodeBackfill.class);

    private static final Pattern CODE_BLOCK_PATTERN = Pattern.compile("```([\\w#+-]*)\\R([\\s\\S]*?)```");
    private static final Pattern C_FUNCTION_PATTERN = Pattern.compile("(?m)^\\s*[A-Za-z_][\\w\\s\\*]*\\s+[A-Za-z_]\\w*\\s*\\([^;\\n]*\\)\\s*\\{");
    private static final Pattern CPP_FUNCTION_PATTERN = Pattern.compile("(?m)^\\s*[A-Za-z_][\\w\\s:\\*&<>]*\\s+[A-Za-z_]\\w*\\s*\\([^;\\n]*\\)\\s*\\{");
    private static final Pattern JAVA_STATIC_METHOD_PATTERN = Pattern.compile("(?m)^\\s*(public|private|protected)?\\s*static\\s+[\\w<>,\\[\\]]+\\s+[A-Za-z_]\\w*\\s*\\([^)]*\\)\\s*\\{");
    private static final Pattern CSHARP_STATIC_METHOD_PATTERN = Pattern.compile("(?m)^\\s*(public|private|protected|internal)?\\s*static\\s+[\\w<>,\\[\\]?]+\\s+[A-Za-z_]\\w*\\s*\\([^)]*\\)\\s*\\{");
    private static final Pattern MAIN_PATTERN = Pattern.compile("(?i)\\bmain\\s*\\(");
    private static final Pattern JAVA_MAIN_PATTERN = Pattern.compile("(?i)\\bpublic\\s+static\\s+void\\s+main\\s*\\(");
    private static final Pattern CSHARP_MAIN_PATTERN = Pattern.compile("(?i)\\bstatic\\s+void\\s+Main\\s*\\(");
    private static final Pattern LEGACY_OID_REFERENCE_PATTERN = Pattern.compile("^\\d{5,}$");

    private static final Map<String, String> LANGUAGE_ALIASES = Map.ofEntries(
            Map.entry("js", "javascript"),
            Map.entry("javascript", "javascript"),
            Map.entry("py", "python"),
            Map.entry("python", "python"),
            Map.entry("c", "c"),
            Map.entry("cpp", "cpp"),
            Map.entry("c++", "cpp"),
            Map.entry("java", "java"),
            Map.entry("cs", "csharp"),
            Map.entry("c#", "csharp"),
            Map.entry("csharp", "csharp"),
            Map.entry("mysql", "sql"),
            Map.entry("sql", "sql"),
            Map.entry("html", "html"),
            Map.entry("css", "css"),
            Map.entry("text", "plaintext"),
            Map.entry("plaintext", "plaintext")
    );

    private final LessonRepository lessonRepository;

    public LessonStarterCodeBackfill(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<Lesson> lessons = lessonRepository.findAllWithCourseAndLanguage();
        if (lessons.isEmpty()) {
            return;
        }

        List<Lesson> toUpdate = new ArrayList<>();

        for (Lesson lesson : lessons) {
            if (hasText(lesson.getStarterCode()) && !isLegacyOidReference(lesson.getStarterCode())) {
                continue;
            }

            String language = resolveLessonLanguage(lesson);
            int orderIndex = lesson.getOrderIndex() == null ? 0 : lesson.getOrderIndex();
            String starterCode = resolveStarterCode(lesson, language, orderIndex);

            if (!hasText(starterCode)) {
                continue;
            }

            lesson.setStarterCode(starterCode.trim());
            toUpdate.add(lesson);
        }

        if (!toUpdate.isEmpty()) {
            lessonRepository.saveAll(toUpdate);
            log.info("Backfilled starterCode for {} lessons.", toUpdate.size());
        }
    }

    private String resolveStarterCode(Lesson lesson, String language, int orderIndex) {
        String fromContent = extractStarterFromContent(lesson.getContent(), language);
        if (isRunnableSnippet(language, fromContent)) {
            return fromContent;
        }
        return generatedStarter(language, orderIndex);
    }

    private String extractStarterFromContent(String content, String language) {
        if (!hasText(content)) {
            return null;
        }

        Matcher matcher = CODE_BLOCK_PATTERN.matcher(content);
        String firstBlock = null;

        while (matcher.find()) {
            String blockLanguage = normalizeLanguage(matcher.group(1));
            String blockCode = matcher.group(2) == null ? "" : matcher.group(2).trim();
            if (!hasText(blockCode)) {
                continue;
            }

            if (firstBlock == null) {
                firstBlock = blockCode;
            }

            if (language.equals(blockLanguage)) {
                return blockCode;
            }
        }

        return firstBlock;
    }

    private boolean isRunnableSnippet(String language, String snippet) {
        if (!hasText(snippet)) {
            return false;
        }

        return switch (language) {
            case "c" -> {
                if (MAIN_PATTERN.matcher(snippet).find()) {
                    yield true;
                }
                yield !C_FUNCTION_PATTERN.matcher(snippet).find();
            }
            case "cpp" -> {
                if (MAIN_PATTERN.matcher(snippet).find()) {
                    yield true;
                }
                yield !CPP_FUNCTION_PATTERN.matcher(snippet).find();
            }
            case "java" -> {
                if (JAVA_MAIN_PATTERN.matcher(snippet).find()) {
                    yield true;
                }
                String lower = snippet.toLowerCase(Locale.ROOT);
                if (lower.contains("class ") || lower.contains("interface ")) {
                    yield false;
                }
                yield !JAVA_STATIC_METHOD_PATTERN.matcher(snippet).find();
            }
            case "csharp" -> {
                if (CSHARP_MAIN_PATTERN.matcher(snippet).find()) {
                    yield true;
                }
                String lower = snippet.toLowerCase(Locale.ROOT);
                if (lower.contains("class ") || lower.contains("interface ") || lower.contains("struct ")) {
                    yield false;
                }
                yield !CSHARP_STATIC_METHOD_PATTERN.matcher(snippet).find();
            }
            default -> true;
        };
    }

    private String resolveLessonLanguage(Lesson lesson) {
        String candidate = lesson.getEditorLanguage();

        if (!hasMeaningfulLanguage(candidate)
                && lesson.getCourse() != null
                && lesson.getCourse().getLanguage() != null) {
            candidate = lesson.getCourse().getLanguage().getCode();
        }

        return normalizeLanguage(candidate);
    }

    private String normalizeLanguage(String rawLanguage) {
        if (!hasText(rawLanguage)) {
            return "plaintext";
        }
        String normalized = rawLanguage.trim().toLowerCase(Locale.ROOT);
        return LANGUAGE_ALIASES.getOrDefault(normalized, normalized);
    }

    private boolean hasMeaningfulLanguage(String value) {
        if (!hasText(value)) {
            return false;
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return !normalized.equals("code")
                && !normalized.equals("text")
                && !normalized.equals("plaintext");
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean isLegacyOidReference(String value) {
        return value != null && LEGACY_OID_REFERENCE_PATTERN.matcher(value.trim()).matches();
    }

    private String l(String... lines) {
        return String.join(System.lineSeparator(), lines);
    }

    private String generatedStarter(String language, int orderIndex) {
        return switch (language) {
            case "c" -> cStarter(orderIndex);
            case "java" -> javaStarter(orderIndex);
            case "python" -> pythonStarter(orderIndex);
            case "cpp" -> cppStarter(orderIndex);
            case "sql" -> sqlStarter(orderIndex);
            case "csharp" -> csharpStarter(orderIndex);
            case "html" -> htmlStarter(orderIndex);
            case "css" -> cssStarter(orderIndex);
            case "javascript" -> jsStarter(orderIndex);
            default -> "// Ecrivez votre code ici";
        };
    }

    private String cStarter(int orderIndex) {
        return switch (orderIndex) {
            case 1 -> l(
                    "#include <stdio.h>",
                    "int main(){",
                    "  int age=20; double note=15.5; char grade='A';",
                    "  printf(\"age=%d note=%.1f grade=%c\\\\n\", age, note, grade);",
                    "  return 0;",
                    "}"
            );
            case 5 -> l(
                    "#include <stdio.h>",
                    "int add(int a,int b){ return a+b; }",
                    "int main(){ printf(\"2+3=%d\\\\n\", add(2,3)); return 0; }"
            );
            case 6 -> l(
                    "#include <stdio.h>",
                    "int globalCount = 100;",
                    "void counter(){ static int localCount=0; localCount++; printf(\"global=%d local=%d\\\\n\", globalCount, localCount); }",
                    "int main(){ counter(); counter(); return 0; }"
            );
            case 16 -> l(
                    "#include <stdio.h>",
                    "int factorial(int n){ return (n<=1)?1:n*factorial(n-1); }",
                    "int main(){ printf(\"factorial(5)=%d\\\\n\", factorial(5)); return 0; }"
            );
            case 18 -> l(
                    "#include <stdio.h>",
                    "int add(int a,int b){ return a+b; }",
                    "int main(){ int (*op)(int,int)=add; printf(\"result=%d\\\\n\", op(7,5)); return 0; }"
            );
            case 20 -> l(
                    "#include <stdio.h>",
                    "int main(){",
                    "  printf(\"Quiz C: revise variables, pointeurs, fonctions et fichiers.\\\\n\");",
                    "  return 0;",
                    "}"
            );
            default -> l(
                    "#include <stdio.h>",
                    "int main(){ printf(\"Hello from C\\\\n\"); return 0; }"
            );
        };
    }

    private String javaStarter(int orderIndex) {
        return switch (orderIndex) {
            case 1 -> l(
                    "public class Main {",
                    "  public static void main(String[] args){",
                    "    int age=20; double note=15.5; String nom=\"Lina\";",
                    "    System.out.println(\"age=\"+age+\" note=\"+note+\" nom=\"+nom);",
                    "  }",
                    "}"
            );
            case 5 -> l(
                    "public class Main {",
                    "  static int add(int a,int b){ return a+b; }",
                    "  public static void main(String[] args){ System.out.println(add(2,3)); }",
                    "}"
            );
            case 6 -> l(
                    "class User { String name; User(String n){ name=n; } void hello(){ System.out.println(\"Bonjour \"+name); } }",
                    "public class Main { public static void main(String[] args){ new User(\"Sami\").hello(); } }"
            );
            case 7 -> l(
                    "class Point { int x,y; Point(int x,int y){ this.x=x; this.y=y; } }",
                    "public class Main { public static void main(String[] args){ Point p=new Point(2,3); System.out.println(\"Point(\"+p.x+\",\"+p.y+\")\"); } }"
            );
            case 8 -> l(
                    "class BankAccount { private double balance; void deposit(double a){ if(a>0) balance+=a; } double getBalance(){ return balance; } }",
                    "public class Main { public static void main(String[] args){ BankAccount a=new BankAccount(); a.deposit(100); System.out.println(a.getBalance()); } }"
            );
            case 9 -> l(
                    "class Animal { void speak(){ System.out.println(\"Animal\"); } }",
                    "class Dog extends Animal { @Override void speak(){ System.out.println(\"Woof\"); } }",
                    "public class Main { public static void main(String[] args){ Animal a=new Dog(); a.speak(); } }"
            );
            case 11 -> l(
                    "interface Drawable { void draw(); }",
                    "class Button implements Drawable { public void draw(){ System.out.println(\"Button drawn\"); } }",
                    "public class Main { public static void main(String[] args){ Drawable d=new Button(); d.draw(); } }"
            );
            case 19 -> l(
                    "import java.util.*;",
                    "class Task { String title; boolean done; Task(String t){ title=t; } }",
                    "public class Main { public static void main(String[] args){",
                    "  List<Task> tasks=new ArrayList<>(); tasks.add(new Task(\"Lire\")); tasks.add(new Task(\"Coder\"));",
                    "  tasks.get(0).done=true;",
                    "  long doneCount=tasks.stream().filter(t->t.done).count();",
                    "  System.out.println(\"Done tasks: \"+doneCount);",
                    "} }"
            );
            case 20 -> l(
                    "public class Main {",
                    "  public static void main(String[] args){",
                    "    System.out.println(\"Quiz Java: revise OOP, exceptions, collections et streams.\");",
                    "  }",
                    "}"
            );
            default -> l(
                    "public class Main {",
                    "  public static void main(String[] args){ System.out.println(\"Hello from Java\"); }",
                    "}"
            );
        };
    }

    private String pythonStarter(int orderIndex) {
        return switch (orderIndex) {
            case 20 -> "print(\"Quiz Python: revise fonctions, collections, exceptions et OOP.\")";
            default -> l(
                    "age = 20",
                    "note = 15.5",
                    "print(f\"age={age} note={note}\")"
            );
        };
    }

    private String cppStarter(int orderIndex) {
        return switch (orderIndex) {
            case 1 -> l("#include <iostream>", "int main(){ int age=20; double note=15.5; std::cout<<\"age=\"<<age<<\" note=\"<<note<<std::endl; return 0; }");
            case 2 -> l("#include <iostream>", "#include <sstream>", "int main(){ std::istringstream in(\"24 15.5\"); int age; double note; in>>age>>note; std::cout<<age<<\" \"<<note<<std::endl; return 0; }");
            case 3 -> l("#include <iostream>", "int main(){ int a=10,b=3; std::cout<<\"a+b=\"<<(a+b)<<\" a%b=\"<<(a%b)<<std::endl; return 0; }");
            case 4 -> l("#include <iostream>", "int main(){ int note=12; if(note>=10) std::cout<<\"Admis\"; else std::cout<<\"Ajourne\"; return 0; }");
            case 5 -> l("#include <iostream>", "int main(){ int sum=0; for(int i=1;i<=5;i++) sum+=i; std::cout<<sum<<std::endl; return 0; }");
            case 6 -> l("#include <iostream>", "int add(int a,int b){ return a+b; }", "int main(){ std::cout<<add(2,3)<<std::endl; return 0; }");
            case 7 -> l("#include <iostream>", "int main(){ int x=10; int& ref=x; int* p=&x; ref=25; std::cout<<x<<\" \"<<*p<<std::endl; return 0; }");
            case 8 -> l("#include <iostream>", "#include <vector>", "int main(){ std::vector<int> v{2,4,6}; v.push_back(8); std::cout<<v.back()<<std::endl; return 0; }");
            case 9 -> l("#include <iostream>", "#include <string>", "int main(){ std::string s=\"Unicode\"; s+=\" C++\"; std::cout<<s<<std::endl; return 0; }");
            case 10 -> l("#include <iostream>", "#include <string>", "struct Student{ std::string name; int score; };", "int main(){ Student s{\"Nour\",16}; std::cout<<s.name<<\" \"<<s.score<<std::endl; return 0; }");
            case 11 -> l("#include <iostream>", "#include <string>", "class User{ public: User(std::string n):name(n){} void hello()const{ std::cout<<\"Bonjour \"<<name<<std::endl; } private: std::string name; };", "int main(){ User u(\"Sami\"); u.hello(); return 0; }");
            case 12 -> l("#include <iostream>", "class Counter{ public: void inc(){value++;} int get()const{return value;} private:int value=0; };", "int main(){ Counter c; c.inc(); c.inc(); std::cout<<c.get()<<std::endl; return 0; }");
            case 13 -> l("#include <iostream>", "class Animal{ public: void speak()const{ std::cout<<\"Animal\"<<std::endl; } };", "class Dog: public Animal{ public: void bark()const{ std::cout<<\"Woof\"<<std::endl; } };", "int main(){ Dog d; d.speak(); d.bark(); return 0; }");
            case 14 -> l("#include <iostream>", "class Shape{ public: virtual void draw()const{ std::cout<<\"Shape\"<<std::endl; } virtual ~Shape()=default; };", "class Circle: public Shape{ public: void draw()const override{ std::cout<<\"Circle\"<<std::endl; } };", "int main(){ Shape* s=new Circle(); s->draw(); delete s; return 0; }");
            case 15 -> l("#include <iostream>", "template<typename T> T maxOf(T a,T b){ return (a>b)?a:b; }", "int main(){ std::cout<<maxOf(5,9)<<std::endl; return 0; }");
            case 16 -> l("#include <algorithm>", "#include <iostream>", "#include <vector>", "int main(){ std::vector<int> n{5,1,4,2}; std::sort(n.begin(), n.end()); for(int x:n) std::cout<<x<<\" \"; std::cout<<std::endl; return 0; }");
            case 17 -> l("#include <fstream>", "#include <iostream>", "#include <string>", "int main(){ std::ofstream(\"cpp_demo.txt\")<<\"Bonjour C++\"<<std::endl; std::ifstream in(\"cpp_demo.txt\"); std::string line; std::getline(in,line); std::cout<<line<<std::endl; return 0; }");
            case 18 -> l("#include <iostream>", "int main(){ int* v=new int[3]{1,2,3}; std::cout<<(v[0]+v[1]+v[2])<<std::endl; delete[] v; return 0; }");
            case 19 -> l("#include <iostream>", "#include <stdexcept>", "int main(){ try{ throw std::runtime_error(\"Operation invalide\"); } catch(const std::exception& e){ std::cout<<e.what()<<std::endl; } return 0; }");
            case 20 -> l("#include <iostream>", "int main(){ std::cout<<\"Quiz C++: revise OOP, STL et memoire.\"<<std::endl; return 0; }");
            default -> l("#include <iostream>", "int main(){ std::cout<<\"Hello from C++\"<<std::endl; return 0; }");
        };
    }

    private String sqlStarter(int orderIndex) {
        return switch (orderIndex) {
            case 1 -> "SELECT 'Bienvenue dans le playground SQL' AS message, 2026 AS annee;";
            case 2 -> l("CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(100), age INT);");
            case 3 -> l("CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(100), age INT);", "INSERT INTO students VALUES (1, 'Amina', 20), (2, 'Youssef', 22);", "SELECT * FROM students;");
            case 4 -> l("CREATE TABLE products (id INT PRIMARY KEY, label VARCHAR(100), price DECIMAL(10,2));", "INSERT INTO products VALUES (1, 'Clavier', 120.00), (2, 'Souris', 45.50);", "SELECT id, label, price FROM products;");
            case 5 -> l("CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(100), age INT);", "INSERT INTO students VALUES (1, 'Lina', 19), (2, 'Omar', 23), (3, 'Nour', 21);", "SELECT name, age FROM students WHERE age >= 21;");
            case 6 -> l("CREATE TABLE scores (id INT PRIMARY KEY, student VARCHAR(100), score INT);", "INSERT INTO scores VALUES (1, 'Ali', 14), (2, 'Maya', 18), (3, 'Sami', 16);", "SELECT student, score FROM scores ORDER BY score DESC LIMIT 2;");
            case 7 -> l("CREATE TABLE sales (id INT PRIMARY KEY, amount DECIMAL(10,2));", "INSERT INTO sales VALUES (1, 100.00), (2, 230.50), (3, 80.00);", "SELECT COUNT(*) AS total_rows, SUM(amount) AS total_amount, AVG(amount) AS avg_amount FROM sales;");
            case 8 -> l("CREATE TABLE sales (id INT PRIMARY KEY, city VARCHAR(80), amount DECIMAL(10,2));", "INSERT INTO sales VALUES (1, 'Tunis', 100), (2, 'Tunis', 140), (3, 'Sfax', 90);", "SELECT city, SUM(amount) AS total FROM sales GROUP BY city HAVING SUM(amount) >= 150;");
            case 9 -> l("CREATE TABLE departments (id INT PRIMARY KEY, name VARCHAR(100));", "CREATE TABLE employees (id INT PRIMARY KEY, name VARCHAR(100), department_id INT);", "INSERT INTO departments VALUES (1, 'IT'), (2, 'HR');", "INSERT INTO employees VALUES (1, 'Nour', 1), (2, 'Sana', 2);", "SELECT e.name, d.name AS department FROM employees e INNER JOIN departments d ON e.department_id = d.id;");
            case 10 -> l("CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(100));", "CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, amount DECIMAL(10,2));", "INSERT INTO customers VALUES (1, 'Ali'), (2, 'Meriem');", "INSERT INTO orders VALUES (1, 1, 120.00);", "SELECT c.name, o.amount FROM customers c LEFT JOIN orders o ON c.id = o.customer_id;");
            case 11 -> l("CREATE TABLE employees (id INT PRIMARY KEY, name VARCHAR(100), salary INT);", "INSERT INTO employees VALUES (1, 'A', 1200), (2, 'B', 1800), (3, 'C', 1500);", "SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);");
            case 12 -> l("CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100), status VARCHAR(20));", "INSERT INTO users VALUES (1, 'Lina', 'inactive'), (2, 'Omar', 'inactive');", "UPDATE users SET status = 'active' WHERE id = 1;", "SELECT * FROM users;");
            case 13 -> l("CREATE TABLE logs (id INT PRIMARY KEY, level VARCHAR(20));", "INSERT INTO logs VALUES (1, 'INFO'), (2, 'ERROR'), (3, 'INFO');", "DELETE FROM logs WHERE level = 'ERROR';", "SELECT * FROM logs;");
            case 14 -> l("CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(120));", "CREATE INDEX idx_users_email ON users(email);", "INSERT INTO users VALUES (1, 'a@unicode.tn'), (2, 'b@unicode.tn');", "SELECT * FROM users WHERE email LIKE '%@unicode.tn';");
            case 15 -> l("CREATE TABLE accounts (id INT PRIMARY KEY, username VARCHAR(50) UNIQUE, age INT CHECK (age >= 0));", "INSERT INTO accounts VALUES (1, 'sami', 21);", "SELECT * FROM accounts;");
            case 16 -> l("CREATE TABLE wallet (id INT PRIMARY KEY, owner VARCHAR(80), balance INT);", "INSERT INTO wallet VALUES (1, 'Ali', 100), (2, 'Nour', 40);", "SET AUTOCOMMIT FALSE;", "UPDATE wallet SET balance = balance - 20 WHERE id = 1;", "UPDATE wallet SET balance = balance + 20 WHERE id = 2;", "COMMIT;", "SET AUTOCOMMIT TRUE;", "SELECT * FROM wallet ORDER BY id;");
            case 17 -> l("CREATE TABLE sales (id INT PRIMARY KEY, city VARCHAR(80), amount INT);", "INSERT INTO sales VALUES (1, 'Tunis', 120), (2, 'Sfax', 80), (3, 'Tunis', 60);", "CREATE VIEW city_totals AS SELECT city, SUM(amount) AS total FROM sales GROUP BY city;", "SELECT * FROM city_totals;");
            case 18 -> l("CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, amount INT);", "INSERT INTO orders VALUES (1, 10, 150), (2, 10, 80), (3, 20, 90);", "SELECT 'Sandbox note: stored procedures are not enabled, so this lesson uses a reusable query.' AS info;", "SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id;");
            case 19 -> "SELECT UPPER('unicode') AS upper_value, LENGTH('academy') AS length_value, ROUND(12.345, 2) AS rounded_value;";
            case 20 -> l("CREATE TABLE quiz_scores (id INT PRIMARY KEY, student VARCHAR(80), score INT);", "INSERT INTO quiz_scores VALUES (1, 'Ali', 12), (2, 'Maya', 17), (3, 'Sami', 9);", "SELECT student, score FROM quiz_scores WHERE score >= 10 ORDER BY score DESC;");
            default -> "SELECT 'Hello from SQL sandbox' AS message;";
        };
    }

    private String csharpStarter(int orderIndex) {
        return switch (orderIndex) {
            case 1 -> l("using System;", "class Program { static void Main(){ int age=20; double note=15.5; string name=\"Lina\"; Console.WriteLine($\"age={age} note={note} name={name}\"); } }");
            case 2 -> l("using System;", "using System.Globalization;", "class Program { static void Main(){ string raw=\"24|15.5\"; string[] p=raw.Split('|'); int age=int.Parse(p[0]); double note=double.Parse(p[1], CultureInfo.InvariantCulture); Console.WriteLine($\"age={age} note={note}\"); } }");
            case 3 -> l("using System;", "class Program { static void Main(){ int a=10,b=3; Console.WriteLine($\"a+b={a+b} a%b={a%b}\"); Console.WriteLine(a>b && b<5); } }");
            case 4 -> l("using System;", "class Program { static void Main(){ int note=12; if(note>=10) Console.WriteLine(\"Admis\"); else Console.WriteLine(\"Ajourne\"); } }");
            case 5 -> l("using System;", "class Program { static void Main(){ int sum=0; for(int i=1;i<=5;i++) sum+=i; Console.WriteLine(sum); } }");
            case 6 -> l("using System;", "class Program { static int Add(int a,int b){ return a+b; } static void Main(){ Console.WriteLine(Add(2,3)); } }");
            case 7 -> l("using System;", "class User { public string Name=\"\"; public void Hello(){ Console.WriteLine($\"Bonjour {Name}\"); } }", "class Program { static void Main(){ var u=new User{ Name=\"Nour\" }; u.Hello(); } }");
            case 8 -> l("using System;", "class Product { public string Name; public Product(string name){ Name=name; } }", "class Program { static void Main(){ Console.WriteLine(new Product(\"Keyboard\").Name); } }");
            case 9 -> l("using System;", "class BankAccount { public double Balance { get; private set; } public void Deposit(double a){ if(a>0) Balance+=a; } }", "class Program { static void Main(){ var a=new BankAccount(); a.Deposit(100); Console.WriteLine(a.Balance); } }");
            case 10 -> l("using System;", "class Animal { public void Speak(){ Console.WriteLine(\"Animal\"); } }", "class Dog : Animal { public void Bark(){ Console.WriteLine(\"Woof\"); } }", "class Program { static void Main(){ var d=new Dog(); d.Speak(); d.Bark(); } }");
            case 11 -> l("using System;", "interface IPrintable { void Print(); }", "class Invoice : IPrintable { public void Print(){ Console.WriteLine(\"Invoice printed\"); } }", "class Program { static void Main(){ IPrintable p=new Invoice(); p.Print(); } }");
            case 12 -> l("using System;", "using System.Collections.Generic;", "class Program { static void Main(){ var list=new List<int>{12,15,18}; list.Add(20); Console.WriteLine(list.Count); } }");
            case 13 -> l("using System;", "using System.Linq;", "class Program { static void Main(){ int[] values={3,6,9,12}; var q=values.Where(v=>v>=9).Select(v=>v*2); Console.WriteLine(string.Join(\",\", q)); } }");
            case 14 -> l("using System;", "class Program { static void Main(){ try{ int.Parse(\"abc\"); } catch(FormatException ex){ Console.WriteLine(ex.Message); } } }");
            case 15 -> l("using System;", "using System.IO;", "class Program { static void Main(){ File.WriteAllText(\"csharp_demo.txt\", \"Bonjour C#\"); Console.WriteLine(File.ReadAllText(\"csharp_demo.txt\")); } }");
            case 16 -> l("using System;", "using System.Threading.Tasks;", "class Program { static async Task<string> GetDataAsync(){ await Task.Delay(100); return \"done\"; } static void Main(){ Console.WriteLine(GetDataAsync().GetAwaiter().GetResult()); } }");
            case 17 -> l("using System;", "class Program { static void Main(){ int? age=null; Console.WriteLine(age ?? 18); } }");
            case 18 -> l("using System;", "enum Level { Beginner, Intermediate, Advanced }", "struct Point { public int X; public int Y; }", "class Program { static void Main(){ Point p=new Point{X=2,Y=3}; Console.WriteLine($\"{p.X},{p.Y} - {Level.Intermediate}\"); } }");
            case 19 -> l("using System;", "class Button { public event Action? Clicked; public void Trigger(){ Clicked?.Invoke(); } }", "class Program { static void Main(){ var b=new Button(); b.Clicked += () => Console.WriteLine(\"Button clicked\"); b.Trigger(); } }");
            case 20 -> l("using System;", "class Program { static void Main(){ Console.WriteLine(\"Quiz C#: revise OOP, LINQ et exceptions.\"); } }");
            default -> l("using System;", "class Program { static void Main(){ Console.WriteLine(\"Hello from C#\"); } }");
        };
    }

    private String htmlStarter(int orderIndex) {
        return switch (orderIndex) {
            case 1 -> l("<!doctype html>", "<html lang=\"fr\"><head><meta charset=\"UTF-8\" /><title>Structure HTML</title></head><body><h1>Bienvenue sur UniCode</h1><p>Structure minimale d un document HTML.</p></body></html>");
            case 2 -> l("<h1>Titre principal</h1>", "<h2>Sous-titre</h2>", "<p><strong>Texte important</strong> et <em>texte emphase</em>.</p>");
            case 3 -> l("<a href=\"https://developer.mozilla.org\" target=\"_blank\" rel=\"noreferrer\">Documentation MDN</a>", "<p><a href=\"#target\">Aller a la section cible</a></p>", "<h3 id=\"target\">Section cible</h3>");
            case 4 -> "<img src=\"https://via.placeholder.com/280x120.png?text=UniCode\" alt=\"Banniere d exemple\" width=\"280\" height=\"120\" />";
            case 5 -> l("<ol>", "  <li>Lire la lecon</li>", "  <li>Tester le code</li>", "  <li>Faire les exercices</li>", "</ol>");
            case 6 -> l("<table border=\"1\" cellpadding=\"6\">", "  <tr><th>Nom</th><th>Score</th></tr>", "  <tr><td>Lina</td><td>16</td></tr>", "  <tr><td>Sami</td><td>14</td></tr>", "</table>");
            case 7 -> l("<form>", "  <label for=\"name\">Nom:</label>", "  <input id=\"name\" name=\"name\" />", "  <button type=\"submit\">Envoyer</button>", "</form>");
            case 8 -> l("<form>", "  <input type=\"email\" placeholder=\"email@unicode.tn\" />", "  <input type=\"password\" placeholder=\"Mot de passe\" />", "  <input type=\"date\" />", "</form>");
            case 9 -> l("<header><h1>Blog UniCode</h1></header>", "<main><article><h2>Article</h2><p>Contenu semantique.</p></article></main>", "<footer>2026 - UniCode</footer>");
            case 10 -> "<video controls width=\"280\"><source src=\"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4\" type=\"video/mp4\" /></video>";
            case 11 -> l("<div class=\"card\"><h2>Bloc principal</h2><p>Un div regroupe des elements.</p></div>", "<section><h3>Section de cours</h3><p>Partie logique du document.</p></section>");
            case 12 -> l("<!doctype html>", "<html lang=\"fr\"><head><meta charset=\"UTF-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" /><meta name=\"description\" content=\"Lecon HTML sur les meta tags\" /><title>Meta tags</title></head><body><p>Inspectez le code source.</p></body></html>");
            case 13 -> l("<h2 id=\"titre-principal\">Accessibilite</h2>", "<img src=\"https://via.placeholder.com/120\" alt=\"Icone accessibilite\" />", "<button aria-describedby=\"titre-principal\">Action</button>");
            case 14 -> l("<button data-level=\"beginner\" data-topic=\"html\">Voir le niveau</button>", "<p>Les attributs data-* stockent des metadonnees.</p>");
            case 15 -> "<iframe title=\"Exemple iframe\" src=\"about:blank\" width=\"280\" height=\"120\"></iframe>";
            case 16 -> l("<form>", "  <input type=\"email\" required />", "  <input type=\"text\" pattern=\"[A-Za-z]{3}\" required />", "  <button type=\"submit\">Verifier</button>", "</form>");
            case 17 -> l("<h1>SEO de base</h1>", "<p>Un titre clair et une description utile aident le referencement.</p>");
            case 18 -> l("<p>Paragraphe (block).</p>", "<p><span>Span 1 (inline)</span> <span>Span 2 (inline)</span></p>");
            case 19 -> l("<details>", "  <summary>Voir la reponse</summary>", "  <p>HTML structure une page web.</p>", "</details>");
            case 20 -> l("<h1>Quiz final HTML</h1>", "<p>Revisez: structure, formulaires, accessibilite et semantique.</p>");
            default -> l("<h1>Hello HTML</h1>", "<p>Ecrivez votre contenu ici.</p>");
        };
    }

    private String cssStarter(int orderIndex) {
        return switch (orderIndex) {
            case 1 -> l("body { font-family: Arial, sans-serif; }", ".card { border: 2px solid #0f766e; }", "#title { color: #0f172a; }");
            case 2 -> ".card { margin: 20px; padding: 16px; border: 2px solid #0ea5e9; width: 260px; }";
            case 3 -> l("body { background: #f8fafc; }", ".card { color: #1e293b; font-size: 1.1rem; width: 60%; }");
            case 4 -> l(".card { font-family: Georgia, serif; font-size: 18px; line-height: 1.6; }", "#title { font-weight: 700; letter-spacing: 0.5px; }");
            case 5 -> l("body { display: flex; justify-content: center; align-items: center; min-height: 100vh; }", ".card { display: flex; flex-direction: column; gap: 8px; }");
            case 6 -> l("body { display: grid; place-items: center; min-height: 100vh; }", ".card { display: grid; grid-template-columns: 1fr; gap: 10px; }");
            case 7 -> l(".card { position: relative; }", "#title { position: relative; left: 8px; top: 4px; }");
            case 8 -> l("#title { display: inline-block; visibility: visible; }", ".card p { display: block; }");
            case 9 -> l("body { background: linear-gradient(135deg, #dbeafe, #f0fdfa); }", ".card { background: rgba(255, 255, 255, 0.85); }");
            case 10 -> ".card { border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12); }";
            case 11 -> l(".card { transition: transform 0.2s ease, box-shadow 0.2s ease; }", ".card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(2, 132, 199, 0.25); }");
            case 12 -> l(".card { transform: rotate(-1deg) scale(1.02); }", "#title { transform: translateX(6px); }");
            case 13 -> l(".card { width: 420px; }", "@media (max-width: 640px) { .card { width: 90%; } }");
            case 14 -> l(".card:hover { border-color: #14b8a6; }", ".card p:first-child { font-weight: 600; }");
            case 15 -> l("#title::before { content: \">> \"; color: #0ea5e9; }", "#title::after { content: \" <<\"; color: #0ea5e9; }");
            case 16 -> l(":root { --primary: #0f766e; --bg: #f8fafc; }", "body { background: var(--bg); }", ".card { border-color: var(--primary); }");
            case 17 -> l("@keyframes pulse { 0%{transform:scale(1);} 50%{transform:scale(1.03);} 100%{transform:scale(1);} }", ".card { animation: pulse 1.5s infinite; }");
            case 18 -> l("body { position: relative; }", ".card { position: relative; z-index: 10; }");
            case 19 -> ".card { max-height: 120px; overflow: auto; }";
            case 20 -> l("p { color: #334155; }", ".card p { color: #0f172a; }", "#title { color: #0f766e; }");
            default -> "body { font-family: Arial, sans-serif; }";
        };
    }

    private String jsStarter(int orderIndex) {
        return switch (orderIndex) {
            case 1 -> l("const course = \"JavaScript\";", "let level = \"beginner\";", "level = \"intermediate\";", "console.log(`Cours: ${course}, niveau: ${level}`);");
            case 2 -> l("const values = [42, \"hello\", true, { language: \"js\" }];", "values.forEach((value) => console.log(value, typeof value));");
            case 3 -> l("const a = 10;", "const b = 3;", "console.log(\"a+b =\", a + b);", "console.log(\"a%b =\", a % b);");
            case 4 -> l("const note = 12;", "if (note >= 10) { console.log(\"Admis\"); } else { console.log(\"Ajourne\"); }");
            case 5 -> l("let sum = 0;", "for (let i = 1; i <= 5; i++) { sum += i; }", "console.log(\"sum =\", sum);");
            case 6 -> l("function add(a, b) { return a + b; }", "const multiply = (a, b) => a * b;", "console.log(add(2, 3), multiply(2, 3));");
            case 7 -> l("const numbers = [2, 4, 6, 8];", "const doubled = numbers.map((n) => n * 2);", "console.log(doubled);");
            case 8 -> l("const student = { name: \"Lina\", score: 16, hello() { return `Bonjour ${this.name}`; } };", "console.log(student.hello());");
            case 9 -> l("const title = document.getElementById(\"title\");", "if (title) { title.textContent = \"DOM selection reussie\"; }");
            case 10 -> l("const title = document.getElementById(\"title\");", "if (title) {", "  title.style.cursor = \"pointer\";", "  title.addEventListener(\"click\", () => { title.textContent = \"Event click capture\"; });", "}");
            case 11 -> l("fetch(\"data:application/json,%7B%22message%22%3A%22Bonjour%20Fetch%22%7D\")", "  .then((response) => response.json())", "  .then((data) => console.log(data.message))", "  .catch((error) => console.error(error));");
            case 12 -> l("function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }", "async function run() { await wait(200); console.log(\"Async termine\"); }", "run();");
            case 13 -> l("const CounterModule = (() => { let count = 0; return { increment() { count += 1; return count; } }; })();", "console.log(CounterModule.increment());");
            case 14 -> l("try { throw new Error(\"Exemple d erreur\"); }", "catch (error) { console.error(\"Capturee:\", error.message); }");
            case 15 -> l("localStorage.setItem(\"lesson\", \"javascript\");", "const saved = localStorage.getItem(\"lesson\");", "console.log(saved);");
            case 16 -> l("const user = { name: \"Maya\", score: 18 };", "const { name, score } = user;", "const [first, second] = [10, 20, 30];", "console.log(name, score, first, second);");
            case 17 -> l("class Animal { speak() { return \"Animal\"; } }", "class Dog extends Animal { speak() { return \"Woof\"; } }", "console.log(new Dog().speak());");
            case 18 -> l("const user = { id: 1, name: \"Ali\" };", "const json = JSON.stringify(user);", "const parsed = JSON.parse(json);", "console.log(json, parsed.name);");
            case 19 -> l("const now = new Date();", "console.log(\"ISO:\", now.toISOString());", "console.log(\"Annee:\", now.getFullYear());");
            case 20 -> "console.log(\"Quiz JavaScript: revise DOM, async, objets, classes et JSON.\");";
            default -> "console.log(\"Hello from JavaScript\");";
        };
    }
}
