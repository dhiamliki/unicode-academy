import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { getCourses, type CourseDto } from "../api/courses";

const languageDisplay: Record<string, string> = {
  c: "C",
  java: "Java",
  python: "Python",
  cpp: "C++",
  mysql: "MySQL",
  csharp: ".NET",
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
};

const languageAliases: Record<string, string[]> = {
  c: ["c language"],
  java: ["jdk"],
  python: ["py"],
  cpp: ["c++", "c plus plus", "cplusplus"],
  mysql: ["sql"],
  csharp: ["c#", "dotnet", ".net", "asp.net"],
  html: ["markup"],
  css: ["styles", "styling"],
  js: ["javascript", "ecmascript"],
};

const languageCodes = Object.keys(languageDisplay);

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCourses();
        if (!cancelled) {
          setCourses(data);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ?? err?.message ?? "Failed to load courses";
        if (!cancelled) {
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
      return courses;
    }

    return courses.filter((course) => {
      const code = (course.languageCode ?? "").toLowerCase();
      const label = languageDisplay[code] ?? code;
      const aliases = languageAliases[code] ?? [];
      const searchable = [
        course.title,
        course.description ?? "",
        code,
        label,
        ...aliases,
      ]
        .map((value) => normalize(value))
        .join(" ");

      return searchable.includes(normalizedQuery);
    });
  }, [courses, query]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: trimmed });
  }

  function setLanguageFilter(code: string) {
    const label = languageDisplay[code] ?? code;
    setQuery(label);
    setSearchParams({ q: label });
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-teal-600" />
          <h2 className="text-2xl font-semibold text-slate-900">Search</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Search by course title or programming language.
        </p>

        <form onSubmit={onSubmit} className="mt-4 flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try JavaScript, C++, SQL, HTML..."
            className="field max-w-xl"
          />
          <button type="submit" className="btn-primary gap-2">
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {languageCodes.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLanguageFilter(code)}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              {languageDisplay[code]}
            </button>
          ))}
        </div>
      </section>

      {loading && <p className="text-sm text-slate-600">Loading courses...</p>}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && (
        <section className="space-y-3">
          <p className="text-sm text-slate-600">
            {filteredCourses.length} result{filteredCourses.length === 1 ? "" : "s"}
          </p>

          {filteredCourses.length === 0 ? (
            <div className="panel p-5 text-sm text-slate-600">
              No course found for this search.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => {
                const code = (course.languageCode ?? "").toLowerCase();
                const language = languageDisplay[code] ?? (course.languageCode ?? "Unknown");

                return (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="panel p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-600">
                      <Sparkles className="h-3 w-3" />
                      {language}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{course.title}</h3>
                    {course.description && (
                      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{course.description}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

