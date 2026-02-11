import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, BarChart3, Brain, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            Phase Diagnostic
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-300">Привет, {user?.name}</span>
                <Button variant="outline" size="sm">
                  Профиль
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Фазовая диагностика акций MOEX
        </h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Анализируйте компании с использованием методологии фазовой диагностики.
          Получайте AI-powered insights на русском языке.
        </p>
        <Button
          size="lg"
          onClick={() => setLocation("/diagnostics")}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          Начать анализ
          <ArrowRight className="w-5 h-5" />
        </Button>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Возможности платформы</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <BarChart3 className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Фазовый анализ</h3>
            <p className="text-slate-300">
              Определение текущей фазы развития компании на основе S-индекса и динамики
            </p>
          </Card>
          <Card className="p-6 bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors">
            <TrendingUp className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Индексы и сигналы</h3>
            <p className="text-slate-300">
              Расчет 4 индексов (IFund, IMarketGap, IStruct, IVola) и выявление слабых сигналов
            </p>
          </Card>
          <Card className="p-6 bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors">
            <Brain className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI интерпретация</h3>
            <p className="text-slate-300">
              Получайте объяснения результатов от AI агента на русском языке
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Card className="p-12 bg-gradient-to-r from-blue-600 to-cyan-600 border-0">
          <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-lg mb-6 text-blue-100">
            Проанализируйте любую компанию MOEX прямо сейчас
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setLocation("/diagnostics")}
            className="gap-2"
          >
            Перейти к анализу
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 text-center text-slate-400">
        <p>2026 Phase Diagnostic Service. Все права защищены.</p>
      </footer>
    </div>
  );
}
