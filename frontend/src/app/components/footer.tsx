import Link from "next/link";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { MdMailOutline } from "react-icons/md";

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
                {
                <div className="flex space-x-4">
                  <Link href="mailto:contato@sancabrecho.com.br?subject=Contato Sanca Brechó" className="text-gray-500 hover:text-sanca">
                    <MdMailOutline className="text-2xl"/>
                  </Link>
                  <Link href="https://www.instagram.com/uspcodelabsanca/" className="text-gray-500 hover:text-sanca">
                    <FaInstagram className="text-2xl"/>
                  </Link>
                  <Link href="https://github.com/USPCodeLabSanca/sanca-brecho" className="text-gray-500 hover:text-sanca">
                    <FaGithub className="text-2xl"/>
                  </Link>
                </div>
                }
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
                <li><Link className="text-gray-600 hover:text-indigo-500" href="/termos">Termos de Uso</Link></li>
                <li><Link className="text-gray-600 hover:text-indigo-500" href="/privacidade">Políticas de Privacidade</Link></li>
                <li>
                  <Link 
                    className="text-gray-600 hover:text-sanca" 
                    href="https://github.com/USPCodeLabSanca/sanca-brecho" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Código-fonte
                  </Link>
                </li>
                </ul>
              </div>


            </div>

            <div className="border-t border-gray-200 mt-8 pt-6">
              <p className="text-sm text-gray-600 text-center">
              ©  2025 Sanca Brechó - Feito com 💜 por <a href="https://codelab.icmc.usp.br/" target="_blank" rel="noopener noreferrer" className="text-sanca font-medium hover:underline">USPCodeLab Sanca</a>
              </p>
            </div>
          </div>
        </footer>
    )
  }
