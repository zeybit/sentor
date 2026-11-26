// DENEME: React Native Reusables (shadcn/ui'nin React Native sürümü) bileşenleri, Sentor içeriği ve "Rasathane" paletiyle.
// Ana uygulamaya bağlı değil; yalnızca bu dalda, önizleme için.
import '../global.css';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, type Option } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppFonts } from '../src/fonts';

function Block({ n, title, note, children }: { n: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <View className="mb-10">
      <Text className="text-gold text-xs font-medium tracking-widest">{n}</Text>
      <Text className="font-serif text-2xl text-foreground">{title}</Text>
      <Text className="text-muted-foreground mb-4 mt-1 text-sm">{note}</Text>
      {children}
    </View>
  );
}

export default function KitDemo() {
  const fontsReady = useAppFonts();
  const [person, setPerson] = React.useState<Option>({ value: 'can', label: 'Can' });
  const [notif, setNotif] = React.useState(true);
  const [tab, setTab] = React.useState('pair');
  if (!fontsReady) return null;
  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="mx-auto w-full max-w-2xl px-4 py-10">
        <Text className="text-gold text-xs font-medium tracking-widest">DENEME · UI KİT</Text>
        <Text className="font-serif text-4xl text-foreground">React Native Reusables</Text>
        <Text className="text-muted-foreground mb-10 mt-2">
          shadcn/ui’nin React Native sürümü; uygulamanın gece paleti ve yazı tipleriyle. Hepsi telefonda ve webde aynı kodla çalışır, klavye ve ekran okuyucu desteği hazır gelir.
        </Text>

        <Block n="01" title="Kişi seçici (Select)" note="Uyum analizi ve ilişki hikâyesindeki kişi çiplerinin yerine: kişi sayısı arttıkça yer kaplamaz.">
          <Select value={person} onValueChange={setPerson}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Bir kişi seç" />
            </SelectTrigger>
            <SelectContent className="w-full max-w-xs">
              <SelectGroup>
                <SelectLabel>Kayıtlı kişiler</SelectLabel>
                <SelectItem label="Can" value="can">Can</SelectItem>
                <SelectItem label="Elif" value="elif">Elif</SelectItem>
                <SelectItem label="Mert" value="mert">Mert</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Text className="text-muted-foreground mt-2 text-sm">Seçili: {person?.label}</Text>
        </Block>

        <Block n="02" title="Sekmeler (Tabs)" note="Uyum analizindeki İki kişi / Grup geçişi.">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="pair"><Text>İki kişi</Text></TabsTrigger>
              <TabsTrigger value="group"><Text>Grup</Text></TabsTrigger>
            </TabsList>
            <TabsContent value="pair">
              <Card className="mt-2">
                <CardHeader>
                  <CardTitle className="font-serif text-xl font-normal">Ayşe ve Can · %59 uyum</CardTitle>
                  <CardDescription>Ay’lar birbirine kare: duygusal ritimleriniz farklı.</CardDescription>
                </CardHeader>
                <CardContent className="flex-row flex-wrap gap-2">
                  <Badge><Text>Çekim güçlü</Text></Badge>
                  <Badge variant="secondary"><Text>İletişim orta</Text></Badge>
                  <Badge variant="outline"><Text>Ay–Ay karesi</Text></Badge>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="group">
              <Card className="mt-2"><CardContent className="pt-6"><Text>Grup ısı haritası burada görünür.</Text></CardContent></Card>
            </TabsContent>
          </Tabs>
        </Block>

        <Block n="03" title="Açılır pencere (Dialog)" note="Uyum daveti gibi akışlar için: arka plan kararır, Esc ve dışarı tıklama ile kapanır, odak pencerede kalır.">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="self-start"><Text>Doğum bilgisini bilmiyor musun? Davet gönder</Text></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl font-normal">Uyum daveti</DialogTitle>
                <DialogDescription>Bağlantıyı açan kişi doğum bilgisini kendi girer; sonuç ikinize de görünür. Bilgileri kimse dışarıda görmez.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost"><Text>Vazgeç</Text></Button></DialogClose>
                <Button><Text>Daveti paylaş</Text></Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Block>

        <Block n="04" title="İpucu (Tooltip)" note="Bölüm başlıklarındaki ⓘ açıklaması: webde üzerine gelince, telefonda dokununca açılır.">
          <Tooltip delayDuration={150}>
            <TooltipTrigger className="self-start">
              <Text className="font-serif text-3xl text-foreground">Sen kimsin <Text className="text-muted-foreground text-base">ⓘ</Text></Text>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <Text className="text-sm">Bir doğum haritası, doğduğun an gökyüzünün fotoğrafıdır. Güneş özünü, Ay duygularını, yükselen dışarıya nasıl göründüğünü anlatır.</Text>
            </TooltipContent>
          </Tooltip>
        </Block>

        <Block n="05" title="Akordeon (Accordion)" note="Uzun yorumlar için “Devamını oku” yerine: başlıklar görünür, okumak istenen açılır.">
          <Accordion type="multiple" defaultValue={['ptolemy']}>
            <AccordionItem value="ptolemy">
              <AccordionTrigger><Text>Batlamyus’un kuralı</Text></AccordionTrigger>
              <AccordionContent><Text className="text-muted-foreground">Erken evlenmeye ya da kendinden genç biriyle evlenmeye yatkınsın. Haritan tek ve kalıcı bir evliliği tarif ediyor.</Text></AccordionContent>
            </AccordionItem>
            <AccordionItem value="dk">
              <AccordionTrigger><Text>Darakaraka</Text></AccordionTrigger>
              <AccordionContent><Text className="text-muted-foreground">Eşin ciddi, disiplinli, güvenilir; yaşından olgun ya da senden büyük biri.</Text></AccordionContent>
            </AccordionItem>
            <AccordionItem value="dir">
              <AccordionTrigger><Text>Hangi yönden, ne kadar uzaktan?</Text></AccordionTrigger>
              <AccordionContent><Text className="text-muted-foreground">Eşin doğduğun yere göre batı yönünden ve uzaktan çıkar.</Text></AccordionContent>
            </AccordionItem>
          </Accordion>
        </Block>

        <Block n="06" title="Menü (Dropdown Menu) ve anahtar (Switch)" note="Kişi kartındaki ⋯ menüsü ve ayarlardaki açma-kapama düğmeleri.">
          <View className="flex-row items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Text>Ayşe ⋯</Text></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52">
                <DropdownMenuLabel><Text>Ayşe</Text></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Text>Doğum bilgisini düzenle</Text></DropdownMenuItem>
                <DropdownMenuItem><Text>Haritayı PDF indir</Text></DropdownMenuItem>
                <DropdownMenuItem><Text>Uyum daveti gönder</Text></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive"><Text>Kişiyi sil</Text></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <View className="flex-row items-center gap-3">
              <Switch checked={notif} onCheckedChange={setNotif} nativeID="notif" />
              <Text>Günlük gökyüzü bildirimi {notif ? 'açık' : 'kapalı'}</Text>
            </View>
          </View>
        </Block>

        <Separator className="mb-6" />
        <Text className="text-muted-foreground text-sm">Butonlar: </Text>
        <View className="mt-2 flex-row flex-wrap gap-3">
          <Button><Text>Haritamı çıkar</Text></Button>
          <Button variant="secondary"><Text>İkincil</Text></Button>
          <Button variant="outline"><Text>Çerçeveli</Text></Button>
          <Button variant="ghost"><Text>Sade</Text></Button>
          <Button variant="destructive"><Text>Sil</Text></Button>
        </View>
      </ScrollView>
      <PortalHost />
    </View>
  );
}
