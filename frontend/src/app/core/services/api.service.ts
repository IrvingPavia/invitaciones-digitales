import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Event, Guest, EventConfig, KPIs, LandingData, ItineraryItem, Registration, RegistrationStatus } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // Events
  getEvents() { return this.http.get<Event[]>(`${this.api}/events`); }
  getEvent(id: number) { return this.http.get<Event>(`${this.api}/events/${id}`); }
  createEvent(data: Partial<Event>) { return this.http.post<any>(`${this.api}/events`, data); }
  updateEvent(id: number, data: Partial<Event>) { return this.http.put<any>(`${this.api}/events/${id}`, data); }
  deleteEvent(id: number) { return this.http.delete<any>(`${this.api}/events/${id}`); }

  // Guests
  getGuests(eventId: number) { return this.http.get<Guest[]>(`${this.api}/guests/event/${eventId}`); }
  createGuest(data: Partial<Guest>) { return this.http.post<any>(`${this.api}/guests`, data); }
  updateGuest(id: number, data: Partial<Guest>) { return this.http.put<any>(`${this.api}/guests/${id}`, data); }
  deleteGuest(id: number) { return this.http.delete<any>(`${this.api}/guests/${id}`); }
  getGuestQR(id: number) { return this.http.get<{ qr: string; url: string }>(`${this.api}/guests/${id}/qr`); }
  importGuests(eventId: number, file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<any>(`${this.api}/guests/import/${eventId}`, fd);
  }
  exportGuests(eventId: number) {
    return this.http.get(`${this.api}/guests/export/${eventId}`, { responseType: 'blob' });
  }
  downloadTemplate() {
    return this.http.get(`${this.api}/guests/template/download`, { responseType: 'blob' });
  }

  // Config
  getConfig(eventId: number) { return this.http.get<any>(`${this.api}/config/${eventId}`); }
  saveConfig(eventId: number, config: EventConfig) {
    return this.http.put<any>(`${this.api}/config/${eventId}`, { config_json: config });
  }

  // Itinerary
  getItinerary(eventId: number) { return this.http.get<ItineraryItem[]>(`${this.api}/config/${eventId}/itinerary`); }
  addItineraryItem(eventId: number, item: Partial<ItineraryItem>) {
    return this.http.post<any>(`${this.api}/config/${eventId}/itinerary`, item);
  }
  updateItineraryItem(eventId: number, id: number, item: Partial<ItineraryItem>) {
    return this.http.put<any>(`${this.api}/config/${eventId}/itinerary/${id}`, item);
  }
  deleteItineraryItem(eventId: number, id: number) {
    return this.http.delete<any>(`${this.api}/config/${eventId}/itinerary/${id}`);
  }

  // Photos
  getPhotos(eventId: number) { return this.http.get<any[]>(`${this.api}/config/${eventId}/photos`); }
  uploadPhotos(eventId: number, files: FileList) {
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('files', f));
    return this.http.post<any>(`${this.api}/uploads/photos/${eventId}`, fd);
  }
  deletePhoto(eventId: number, id: number) {
    return this.http.delete<any>(`${this.api}/config/${eventId}/photos/${id}`);
  }

  // Upload single file
  uploadFile(type: 'images' | 'audio' | 'gifs', file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<{ url: string; filename: string }>(`${this.api}/uploads/${type}`, fd);
  }

  // Cards
  getCardTemplate(eventId: number) { return this.http.get<any>(`${this.api}/cards/${eventId}`); }
  saveCardTemplate(eventId: number, data: any) { return this.http.put<any>(`${this.api}/cards/${eventId}`, data); }
  downloadCardsPDF(eventId: number) {
    return this.http.get(`${this.api}/cards/${eventId}/pdf`, { responseType: 'blob' });
  }
  previewCardsPDF(eventId: number) {
    return this.http.get(`${this.api}/cards/${eventId}/pdf/preview`, { responseType: 'blob' });
  }

  // Public
  getLandingData(slug: string) { return this.http.get<LandingData>(`${this.api}/public/invitation/${slug}`); }
  getGuestByCode(slug: string, code: string) {
    return this.http.get<Guest>(`${this.api}/public/invitation/${slug}/guest/${code}`);
  }
  getKPIs(eventId: number) { return this.http.get<KPIs>(`${this.api}/public/kpis/${eventId}`); }

  // RSVP
  getRsvpGuest(code: string) { return this.http.get<any>(`${this.api}/rsvp/${code}`); }
  confirmRsvp(code: string, data: any) { return this.http.post<any>(`${this.api}/rsvp/${code}/confirm`, data); }

  // Users
  getUsers() { return this.http.get<any[]>(`${this.api}/users`); }
  createUser(data: any) { return this.http.post<any>(`${this.api}/users`, data); }
  updateUser(id: number, data: any) { return this.http.put<any>(`${this.api}/users/${id}`, data); }
  deleteUser(id: number) { return this.http.delete<any>(`${this.api}/users/${id}`); }
  resetUserPassword(id: number) { return this.http.post<{ password: string }>(`${this.api}/users/${id}/reset-password`, {}); }

  // Registrations (dashboard)
  getRegistrations(eventId: number) { return this.http.get<Registration[]>(`${this.api}/registrations/${eventId}`); }
  deleteRegistration(eventId: number, id: number) { return this.http.delete<any>(`${this.api}/registrations/${eventId}/${id}`); }
  getRegistrationStats(eventId: number) { return this.http.get<{ registered: number; capacity: number | null }>(`${this.api}/registrations/${eventId}/stats`); }

  // Registrations (public)
  getRegistrationStatus(slug: string) { return this.http.get<RegistrationStatus>(`${this.api}/public/register/${slug}/status`); }
  publicRegister(slug: string, data: { name: string; email?: string; phone?: string }) {
    return this.http.post<{ message: string; registered: number; capacity: number | null }>(`${this.api}/public/register/${slug}`, data);
  }

  // Suggestions
  getSuggestions() { return this.http.get<any[]>(`${this.api}/suggestions`); }
  createSuggestion(data: { text: string; category?: string; event_id?: number }) {
    return this.http.post<any>(`${this.api}/suggestions`, data);
  }
  updateSuggestion(id: number, data: { status?: string; admin_note?: string }) {
    return this.http.put<any>(`${this.api}/suggestions/${id}`, data);
  }
  deleteSuggestion(id: number) { return this.http.delete<any>(`${this.api}/suggestions/${id}`); }
}
