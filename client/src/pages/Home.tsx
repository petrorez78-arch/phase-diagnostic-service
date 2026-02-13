import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  BarChart3,
  Brain,
  ArrowRight,
  Activity,
  Shield,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">Phase Diagnostic</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user?.name}
                </span>
                <Button
                  size="sm"
                  onClick={() => setLocation("/diagnostics")}
                  className="gap-1.5"
                >
                  Анализ
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="gradient-mesh absolute inset-0 opacity-60" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <Zap className="w-3 h-3" />
              Powered by AI + n8n Workflow
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
              Фазовая диагностика
              <br />
              <span className="text-primary">акций MOEX</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Анализируйте компании с использованием методологии фазовой диагностики.
              Получайте структурированные AI-инсайты на русском языке.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => setLocation("/diagnostics")}
                className="gap-2 text-base px-6"
              >
                Начать анализ
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="gap-2 text-base px-6 bg-transparent"
              >
                Подробнее
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Индексов", value: "4", sub: "IFund, IMarketGap, IStruct, IVola" },
              { label: "Фаз", value: "5", sub: "Полный цикл рынка" },
              { label: "Источников", value: "3+", sub: "MOEX, Smart-lab, AI" },
              { label: "Язык ответов", value: "RU", sub: "Русский язык" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
                <p className="text-sm font-medium text-foreground/80">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Возможности платформы</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Комплексный анализ акций с визуализацией данных и AI-интерпретацией
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: BarChart3,
              title: "Фазовый анализ",
              description:
                "Определение текущей фазы развития компании на основе S-индекса, скорости и ускорения динамики",
              color: "oklch(0.68 0.16 250)",
            },
            {
              icon: Activity,
              title: "4 индекса + сигналы",
              description:
                "Расчёт IFund, IMarketGap, IStruct, IVola с визуализацией на радарной диаграмме и шкалах",
              color: "oklch(0.72 0.19 155)",
            },
            {
              icon: Brain,
              title: "AI интерпретация",
              description:
                "Объяснения результатов от AI-агента на русском языке с анализом новостного фона",
              color: "oklch(0.65 0.18 300)",
            },
            {
              icon: Shield,
              title: "Слабые сигналы",
              description:
                "Автоматическое выявление предупреждающих сигналов на основе фазовой динамики и порогов индексов",
              color: "oklch(0.78 0.16 75)",
            },
            {
              icon: TrendingUp,
              title: "Данные MOEX",
              description:
                "Актуальные рыночные данные, история цен за 30 дней и информация о компании с Московской биржи",
              color: "oklch(0.78 0.12 200)",
            },
            {
              icon: Zap,
              title: "n8n Backend",
              description:
                "Все расчёты выполняются в n8n workflow — гибкая архитектура с возможностью расширения",
              color: "oklch(0.65 0.22 25)",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{
                  backgroundColor: `color-mix(in oklch, ${feature.color} 15%, transparent)`,
                }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
              </div>
              <h3 className="text-base font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
            Готовы начать анализ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Введите тикер или название компании и получите полную фазовую диагностику
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/diagnostics")}
            className="gap-2 text-base px-8"
          >
            Перейти к анализу
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            Phase Diagnostic Service
          </div>
          <p className="text-xs text-muted-foreground">2026</p>
        </div>
      </footer>
    </div>
  );
}
