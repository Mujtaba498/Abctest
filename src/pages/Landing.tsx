import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 flex flex-col">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center flex-1 py-24 px-4 text-center">
        <Badge className="mb-4" variant="secondary">Modern CRM Solution</Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
          Welcome to <span className="text-indigo-600">Next.js CRM</span>
        </h1>
        <p className="max-w-xl mx-auto text-lg md:text-2xl text-zinc-600 dark:text-zinc-300 mb-8">
          Streamline your business operations, manage customers, and grow your company with our all-in-one CRM platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8 py-4" asChild>
            <a href="/register">Get Started</a>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Easy Customer Management</CardTitle>
              <CardDescription>Organize, track, and engage your customers with ease.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-zinc-600 dark:text-zinc-300 text-sm space-y-2">
                <li>Centralized customer database</li>
                <li>Quick search and filtering</li>
                <li>Activity tracking</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Powerful Analytics</CardTitle>
              <CardDescription>Gain insights with real-time dashboards and reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-zinc-600 dark:text-zinc-300 text-sm space-y-2">
                <li>Visual dashboards</li>
                <li>Exportable reports</li>
                <li>Customizable metrics</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>Your data is protected with enterprise-grade security.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-zinc-600 dark:text-zinc-300 text-sm space-y-2">
                <li>Role-based access</li>
                <li>Data encryption</li>
                <li>99.9% uptime</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <footer className="py-12 px-4 bg-zinc-100 dark:bg-zinc-950 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">Ready to get started?</h2>
        <p className="mb-6 text-zinc-600 dark:text-zinc-300">Join Next.js CRM today and transform the way you manage your business.</p>
        <Button size="lg" className="text-lg px-8 py-4" asChild>
          <a href="/register">Create Your Free Account</a>
        </Button>
      </footer>
    </div>
  );
}

export default Landing; 