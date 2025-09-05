import React from 'react';

const About = () => {
    return (
        <div className="container mx-auto py-12 space-y-8">
            <h1 className="text-3xl font-bold mb-6">Hakkımızda</h1>

            <p>
                Cinelog, film tutkunları için geliştirilmiş sosyal bir platformdur. Platformumuz, kullanıcıların izledikleri filmleri kaydedebileceği, yorumlayabileceği ve derecelendirebileceği bir dijital günlük sağlar. Her kullanıcı kendi profilinde favori filmlerini sergileyebilir.
            </p>

            <p>
                Platform, sadece bir film günlüğü olmanın ötesine geçerek kullanıcıların topluluk içinde bağlantı kurmasını destekler.
            </p>

            <p>
                Cinelog'un amacı, film deneyimlerini kaydetmenin, paylaşmanın ve keşfetmenin eğlenceli, güvenli ve kullanıcı dostu bir yolunu sunmaktır. Film izleme sürecini kişiselleştirmenize yardımcı olacak araçlar sunarak, her kullanıcının kendi sinema yolculuğunu oluşturmasına olanak tanıyoruz.
            </p>

            <h2 className="text-2xl font-semibold mt-6">Üyelik ve Kullanım</h2>
            <p>
                Cinelog’u keşfetmek için üye olmanız gerekmez; siteyi gezebilir ve içeriklere göz atabilirsiniz. Ancak filmleri kaydetmek, yorum yapmak veya listeler oluşturmak istiyorsanız ücretsiz bir hesap açmanız gerekir. Üyelik süreci hızlıdır ve başka bir üyeden davet almanıza gerek yoktur.
            </p>

            <h2 className="text-2xl font-semibold mt-6">Yakında Gelecek Ekstra Özellikler</h2>
            <p>
                Cinelog üzerinde yakında bazı ekstra özellikleri kullanıma sunmayı planlıyoruz. Bu özellikler arasında reklamsız bir deneyim, kişiselleştirilmiş istatistikler, izleme listesi hatırlatıcıları ve arkadaşlarınızın listelerini kolayca kopyalama gibi avantajlar olacak. Amacımız, film deneyiminizi daha keyifli, derinlemesine ve etkileşimli hâle getirmek.
            </p>
            <p>
                Bu özellikler henüz aktif olmasa da, kısa süre içinde kullanıcılarımızın hizmetine sunulacaktır. Takipte kalın ve yeni özellikler için bildirimleri açmayı unutmayın!
            </p>

        </div>
    );
};

export default About;
