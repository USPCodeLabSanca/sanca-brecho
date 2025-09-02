-- ignorem este arquivo por enquanto. testando a funcionalidade de fts do postgres

INSERT INTO listings (title, keywords) VALUES 
('iphone 13 usado', 'celular iphone'),
('iphone 12 usado', 'celular'),
('iphoe', 'celular telemovel'), -- typo iphone -> iphoe
('celular', 'celular phone'),
('samsung s23', 'celular samsung'),
('samsung', ''),
('xiaomi redmi note 13 pro', 'celular xiaomi'),
('carregador samsung', 'eletronicos samsung carregador'),
('resistencia dos materials', 'livro mecanica dos solidos'),
('estatica aplicada as maquinas 3 edicao', 'livro graduaçao estatica'),
('moletom sacim 2020', 'moletom sacim frio'),
('moletom civil usado', 'moletom'),
('caneca tusca 2014', 'caneca tusca'),
('oculos de sol rayban', 'oculos sol rayban'),
('relogio samsumg', 'relogio samsung'), -- testando typos samsung -> samsumg
('motorola', ''),
('tablet estudos', 'tecnologia tablet samsung'),
('bolsa usada para notebook', 'bolsa mochila notebook');