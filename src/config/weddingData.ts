export interface Ceremony {
  id: string;
  name: string;
  badge?: string;
  date: string;
  displayDate: string;
  time: string;
  venueName: string;
  venueAddress: string;
  quote: string;
  image: string;
  mapUrl?: string;
}

export interface WeddingConfig {
  brideName: string;
  groomName: string;
  togetherTitle: string;
  invitationText: string;
  shloka: {
    symbol: string;
    text: string[];
  };
  weddingDateIso: string;
  weddingDateDisplay: {
    day: string;
    month: string;
    year: string;
    weekday: string;
  };
  mainVenue: {
    name: string;
    road: string;
    city: string;
    fullAddress: string;
    mapEmbedUrl: string;
    mapDirectionsUrl: string;
  };
  ceremonies: Ceremony[];
  couplePhoto: string;
  ganeshIcon: string;
  monogramImage: string;
  heroPoster: string;
  heroVideo: string;
  audioTrack: string;
}

const KABIR_FARM_MAP_LINK = "https://maps.app.goo.gl/W9tr22hJU6C42DHY6";

export const weddingData: WeddingConfig = {
  brideName: "Vanshita",
  groomName: "Ankit",
  togetherTitle: "TOGETHER WITH THEIR FAMILIES",
  invitationText: "We request the honour of your gracious presence to celebrate our wedding",
  shloka: {
    symbol: "ॐ",
    text: [
      "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।",
      "निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
    ]
  },
  weddingDateIso: "2027-01-26T10:30:00+05:30",
  weddingDateDisplay: {
    day: "26",
    month: "JANUARY",
    year: "2027",
    weekday: "TUESDAY"
  },
  mainVenue: {
    name: "\"KABIR FARM\"",
    road: "Somnath Mandir Road, Near Vishala Bridge,",
    city: "Vasna, Ahmedabad, Gujarat",
    fullAddress: "\"KABIR FARM\", Somnath Mandir Road, Near Vishala Bridge, Vasna, Ahmedabad, Gujarat 380007",
    mapEmbedUrl: "https://maps.google.com/maps?q=22.9815614,72.5495848+(Kabir+Farm)&t=&z=16&ie=UTF8&iwloc=&output=embed",
    mapDirectionsUrl: KABIR_FARM_MAP_LINK
  },
  couplePhoto: "/assets/ceremonies/couple.jpeg",
  ganeshIcon: "/assets/ceremonies/ganesh_icon.jpeg",
  monogramImage: "/assets/media/monogram.webp",
  heroPoster: "/assets/media/hero-poster.webp",
  heroVideo: "/assets/media/hero.mp4",
  audioTrack: "/assets/media/music.mp3",
  ceremonies: [
    {
      id: "ganesh-sthapna",
      name: "Ganesh Sthapna",
      badge: "❤ Ganesh Sthapna ❤",
      date: "24 Jan 2027",
      displayDate: "24 JANUARY 2027",
      time: "9:30 AM",
      venueName: "At Our Residence",
      venueAddress: "At Our Residence",
      quote: "With Divine Blessings of Lord Ganesha...❣",
      image: "/assets/ceremonies/ganesh_sthapna.jfif"
      // Note: Location link removed per instructions
    },
    {
      id: "mandap-ropan",
      name: "Mandap Ropan",
      badge: "💖 Mandap Ropan 💖",
      date: "25 Jan 2027",
      displayDate: "25 JANUARY 2027",
      time: "10:45 AM",
      venueName: "\"KABIR FARM\"",
      venueAddress: "Somnath Mandir Road, Near Vishala Bridge, Vasna, Ahmedabad.",
      quote: "A little tradition, a lot of love...❣",
      image: "/assets/ceremonies/mandap_ropan.png",
      mapUrl: KABIR_FARM_MAP_LINK
    },
    {
      id: "mameru",
      name: "Mameru",
      badge: "🎁 Mameru 🎁",
      date: "25 Jan 2027",
      displayDate: "25 JANUARY 2027",
      time: "11:30 AM",
      venueName: "\"KABIR FARM\"",
      venueAddress: "Somnath Mandir Road, Near Vishala Bridge, Vasna, Ahmedabad.",
      quote: "love and blessings...❣",
      image: "/assets/ceremonies/mameru.jfif",
      mapUrl: KABIR_FARM_MAP_LINK
    },
    {
      id: "haldi",
      name: "The Golden Beginning - Haldi",
      badge: "The Golden Beginning - Haldi 💛",
      date: "25 Jan 2027",
      displayDate: "25 JANUARY 2027",
      time: "12:30 PM",
      venueName: "\"KABIR FARM\"",
      venueAddress: "Somnath Mandir Road, Near Vishala Bridge, Vasna, Ahmedabad.",
      quote: "Haldi Vibes & Happy Hearts....❣",
      image: "/assets/ceremonies/haldi.png",
      mapUrl: KABIR_FARM_MAP_LINK
    },
    {
      id: "dance-night",
      name: "An Evening of Beats & Love ~ Dance Night",
      badge: "An Evening of Beats & Love ~ Dance Night 🎶",
      date: "25 Jan 2027",
      displayDate: "25 JANUARY 2027",
      time: "7:00 PM",
      venueName: "\"KABIR FARM\"",
      venueAddress: "Somnath Mandir Road, Near Vishala Bridge, Vasna, Ahmedabad.",
      quote: "Love, Laughter & Dance...❣",
      image: "/assets/ceremonies/dance_night.png",
      mapUrl: KABIR_FARM_MAP_LINK
    },
    {
      id: "jan-aagman",
      name: "Jan Aagman",
      badge: "🚗 Jan Aagman 🚗",
      date: "26 Jan 2027",
      displayDate: "26 JANUARY 2027",
      time: "10.30 AM",
      venueName: "\"KABIR FARM\"",
      venueAddress: "Somnath Mandir Road, Near Vishala Bridge, Vasna, Ahmedabad.",
      quote: "The Grand Arrival of Groom...❣",
      image: "/assets/ceremonies/jan_aagman.png",
      mapUrl: KABIR_FARM_MAP_LINK
    },
    {
      id: "swaruchi-bhojan",
      name: "Swaruchi Bhojan",
      badge: "🍽 Swaruchi Bhojan 🍽",
      date: "26 Jan 2027",
      displayDate: "26 JANUARY 2027",
      time: "12.30 PM",
      venueName: "\"KABIR FARM\"",
      venueAddress: "Somnath Mandir Road, Near Vishala Bridge, Vasna, Ahmedabad.",
      quote: "Love, Laughter & Food...❣",
      image: "/assets/ceremonies/swaruchi_bhojan.jpeg",
      mapUrl: KABIR_FARM_MAP_LINK
    },
    {
      id: "hast-melap",
      name: "Hast Melap",
      badge: "💕 Hast Melap 💕",
      date: "26 Jan 2027",
      displayDate: "26 JANUARY 2027",
      time: "12:39 PM",
      venueName: "\"KABIR FARM\"",
      venueAddress: "Somnath Mandir Road, Near Vishala Bridge, Vasna, Ahmedabad.",
      quote: "Two Souls, One Sacred Bond...❣",
      image: "/assets/ceremonies/hast_melap.png",
      mapUrl: KABIR_FARM_MAP_LINK
    }
  ]
};
