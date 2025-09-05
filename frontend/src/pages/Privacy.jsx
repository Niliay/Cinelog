import React from 'react';

const Privacy = () => {
    return (
        <div className="container mx-auto py-12 space-y-8">
            <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası</h1>

            <p>
                Cinelog, kullanıcı bilgilerinin gizliliğini ciddiye alır ve bu bilgilerin güvenliğini sağlamak için gerekli önlemleri uygular. Bu politika, kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
            </p>

            <h2 className="text-2xl font-semibold mt-6">Toplanan Bilgiler</h2>
            <p>
                Kullanıcılarımızdan toplanan bilgiler şunları içerebilir: Hesap bilgileri (e-posta, kullanıcı adı ve şifre), kullanım bilgileri (izlenen filmler, yorumlar, derecelendirmeler, listeler), cihaz ve ağ bilgileri (IP adresi, cihaz türü, tarayıcı bilgileri) ve iletişim bilgileri (destek talepleri veya anket yanıtları). Bu bilgiler, hizmetin doğru ve güvenli çalışmasını sağlamak için kullanılır.
            </p>

            <h2 className="text-2xl font-semibold mt-6">Bilgilerin Kullanımı</h2>
            <p>
                Toplanan bilgiler, kullanıcı deneyimini iyileştirmek, güvenliği sağlamak, teknik sorunları çözmek ve isteğe bağlı Pro üyelik özelliklerini sunmak amacıyla kullanılır. Cinelog, kullanıcıların gizliliğini korumak için hiçbir kişisel bilgiyi üçüncü taraflara satmaz veya reklam amacıyla paylaşmaz.
            </p>

            <h2 className="text-2xl font-semibold mt-6">Güvenlik Önlemleri</h2>
            <p>
                Cinelog, kullanıcı verilerini korumak için çeşitli teknik ve idari önlemler uygular. Hesap bilgilerinizin ve platform içi aktivitelerinizin güvenliği için düzenli olarak sistem kontrolleri yapılır ve veri erişimi yalnızca yetkili personelle sınırlıdır.
            </p>

            <h2 className="text-2xl font-semibold mt-6">İletişim</h2>
            <p>
                Gizlilik politikamız hakkında sorularınız veya endişeleriniz varsa, <a href="mailto:contact@cinelog.com" className="text-blue-600 underline">contact@cinelog.com</a> adresinden bizimle iletişime geçebilirsiniz.
            </p>
        </div>
    );
};

export default Privacy;
