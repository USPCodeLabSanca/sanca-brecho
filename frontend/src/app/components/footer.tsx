import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 pt-10 pb-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sanca Brechó</h3>
                <p className="text-gray-600 mb-4">
                O marketplace universitário de São Carlos. Compre e venda produtos usados de forma fácil e rápida.
                </p>
                <div className="flex space-x-4">
                <Link href="#" className="text-gray-500 hover:text-sanca">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </Link>
                <Link href="#" className="text-gray-500 hover:text-sanca">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </Link>
                <Link href="#" className="text-gray-500 hover:text-sanca">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </Link>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Links Rápidos</h3>
                <ul className="space-y-2">
                  <li><Link className="text-gray-600 hover:text-indigo-500" href="/">Home</Link></li>
                  <li><Link className="text-gray-600 hover:text-indigo-500" href="/anunciar">Anunciar</Link></li>
                  <li><Link className="text-gray-600 hover:text-indigo-500" href="/categorias">Categorias</Link></li>
                  <li><Link className="text-gray-600 hover:text-indigo-500" href="/como-funciona">Como funciona</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3"> Ajuda e Suporte</h3>
                <ul className="space-y-2">
                <li><Link className="text-gray-600 hover:text-indigo-500" href="/faq">FAQ</Link></li>
                <li><Link className="text-gray-600 hover:text-indigo-500" href="/contato">Contato</Link></li>
                <li><Link className="text-gray-600 hover:text-indigo-500" href="/termos-de-uso">Termos de Uso</Link></li>
                <li><Link className="text-gray-600 hover:text-indigo-500" href="/politica-da-privacidade">Políticas de Privacidade</Link></li>
                </ul>
              </div>


            </div>

            <div className="border-t border-gray-200 mt-8 pt-6">
              <p className="text-sm text-gray-600 text-center">
              ©  2025 Sanca Brechó. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
    )
  }