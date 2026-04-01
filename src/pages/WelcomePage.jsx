import logo from '../assets/logoConFondo.jpeg';
import foto from '../assets/sobreNosotros.png';
import Button from '../components/Button';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans w-full overflow-x-hidden">
      {/* Navigation */}
      <nav className="w-full bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="FluxLab Logo" className="w-8 h-13 rounded-full object-cover" />
            <span className="text-lg font-bold">FluxLab</span>
          </div>
          <ul className="hidden md:flex gap-8 items-center">
            <li><a Nav href="#features" className="text-gray-700 hover:text-gray-900">Características</a></li>
            <li><a Nav href="#about" className="text-gray-700 hover:text-gray-900">Sobre nosotros</a></li>
          </ul>
          <div className="flex gap-4">
            <Button to="/login">
              Iniciar Sesión
            </Button>
          </div> 
        </div>
      </nav>      

      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center text-center px-4 py-16 min-h-[80vh] overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:16px_16px]">
        
        {/* Blobs orgánicos de fondo - Biotecnología */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>

        <div className="relative z-10">
          {/* Badge de New Release */}
          <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full mb-6 inline-block">
            - - - - - - - - -
          </span>

          {/*Títulos*/}
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight max-w-3xl">
            FluxLab: <br />
            <span className="text-emerald-500">El futuro de los Software LIMS</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl">
            Organiza, gestiona y optimiza tus muestras de laboratorio con una mejor visualización
            de tus datos. Diseñado para la precisión científica.
          </p>

          {/* BLOQUE DE LOGIN (Botón + Social)*/}
          <div className="flex justify-center w-full mt-10">
          <Button
            to="/login"
            className="text-center mb-6"
          >
            Comienza ahora con una nueva experiencia
          </Button>

          {/*
            // Comentados por ahora, pero listos para ser implementados con Supabase Social Auth
          // Separador 
          <div className="w-full relative flex items-center justify-center mb-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-3 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
              O ACCEDE CON TU CUENTA
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          // Botones de Google y Microsoft 
          <div className="flex gap-4 justify-center">
            <button className="flex items-center justify-center rounded-xl bg-[#1A1A1A] hover:bg-black transition-all shadow-lg w-14 h-14 group">
              <img
                src="https://www.svgrepo.com/show/448239/microsoft.svg"
                alt="Microsoft"
                className="w-8 h-8 group-hover:scale-110 transition-transform"
              />
            </button>

            <button className="flex items-center justify-center rounded-xl bg-[#1A1A1A] hover:bg-black transition-all shadow-lg w-14 h-14 group">
              <img
                src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
                alt="Google"
                className="w-7 h-7 group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
          */}

        </div>
      </div>
    </div>

      {/* Featured Clients */}
      <section className="w-full bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 text-sm font-semibold mb-8">TODO LO QUE NECESITAS PARA DOMINAR TUS DATOS EN UN SOLO LUGAR</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {['ANALIZA', 'GESTIONA', 'PREDICE', 'ORGANIZA', 'VISUALIZA'].map((company) => (
              <div key={company} className="text-gray-700 font-semibold text-sm">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Ecosistema Digital de Gestión Avanzada
          </h2>
          <p className="text-center text-gray-600 mb-16">
            Arquitectura robusta para garantizar la integridad y trazabilidad de cada muestra.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="mb-4">
                <svg className="w-12 h-12 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 2C7.897 2 7 2.897 7 4v16c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H9zm.5 2h9v14h-9V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Inteligencia de Datos</h3>
              <p className="text-gray-600 mb-4">
                Arrastra tus archivos Excel y deja que nuestro sistema los registre y organice de forma masiva y estructurada.
              </p>
              <div className="space-y-2">
                <div className="h-2 w-24 bg-emerald-200 rounded"></div>
                <div className="h-2 w-32 bg-emerald-300 rounded"></div>
                <div className="h-2 w-20 bg-emerald-200 rounded"></div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-lg">
              <div className="mb-4">
                <svg className="w-12 h-12 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1C6.477 1 2 5.477 2 11s4.477 10 10 10 10-4.477 10-10S17.523 1 12 1zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm3.5-9c.828 0 1.5-.672 1.5-1.5S16.328 7 15.5 7 14 7.672 14 8.5s.672 1.5 1.5 1.5zm-7 0c.828 0 1.5-.672 1.5-1.5S9.328 7 8.5 7 7 7.672 7 8.5 7.672 10 8.5 10zm3.5 7c-2.33 0-4.41-1.255-5.5-3.115C7.08 12.885 9.16 12 12 12s4.92.885 5.5 1.885C16.41 15.745 14.33 17 12 17z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Validación Predictiva de Calidad</h3>
              <p className="text-gray-300 mb-4">
                Genera resúmenes predictivos y detecta anomalías automáticamente para anticipar problemas en tus resultados.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Monitoreo de Desviaciones
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Modelado de Escenarios
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-4">
                <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l2.5-2.5m0 5L7 12m5 2.5L12 7m0 10l-2.5-2.5" />
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Optimización Operativa</h3>
              <p className="text-gray-600 mb-4">
                Reduce el error humano con flujos de trabajo automatizados e integrados en tiempo real con tu equipo.
              </p>
              <div className="flex gap-1 items-end justify-center">
                {[60, 70, 65, 80, 75].map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-300 rounded"
                    style={{ height: `${val / 2}px` }}
                  ></div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <svg className="w-12 h-12 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.362M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.862m-4.101-3.846a4 4 0 11-8 0 4 4 0 018 0zM15 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Centro de Inteligencia Colaborativa</h3>
              <p className="text-gray-600 mb-4">
                Visualiza informes en PDF con estadísticas detalladas y expórtalos al instante para tus clientes.
              </p>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-emerald-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                  >
                    {i}
                  </div>
                ))}
                <div className="text-xs text-gray-600 ml-2">+2</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Sobre Nosotros (About Us) */}
      <section id="about" className="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* Columna de Texto */}
          <div className="space-y-6">
            <span className="text-emerald-1000 font-semibold text-sm tracking-wider uppercase">Sobre nosotros</span>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Impulsando la Precisión Científica a través de la Inteligencia de Datos
            </h2>
            <p className="text-lg text-emerald-1000 leading-relaxed">
              En FluxLab, nacimos de la intersección entre la biotecnología ambiental y la ingeniería de sistemas. Nuestra misión es revolucionar la gestión de laboratorios tradicionales (LIMS), proporcionando una plataforma digital centralizada que garantiza la integridad, trazabilidad y optimización de cada muestra.
            </p>
            <p className="text-lg text-emerald-1000 leading-relaxed">
              No solo organizamos datos; transformamos la información en inteligencia predictiva para anticipar desafíos y acelerar descubrimientos científicos.
            </p>
          </div>

          {/* Columna de Imagen*/}
          <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-xl border border-gray-200">
            <img
              src={foto}
              alt="Visualización digital de datos a través de un microscopio moderno en FluxLab"
              className="w-full h-full object-cover"
            />
            {/* Sutil resplandor esmeralda de fondo */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl z-0"></div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
                  <img src={logo} alt="FluxLab Logo" className="w-8 h-13 rounded-full object-cover" />
                </div>
                <span className="text-white font-bold">FluxLab</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>© 2026 FLUXLAB. DISEÑADO PARA LA PRECISIÓN CIENTÍFICA.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
