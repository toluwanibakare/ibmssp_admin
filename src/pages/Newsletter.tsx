import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Image as ImageIcon, Paperclip, Bold, Italic, List, 
  ListOrdered, AlignLeft, AlignCenter, AlignRight, Underline,
  Eye, Save, Trash2, X, Plus, FileText, CheckCircle2, Loader2,
  Users, UserCheck, GraduationCap, School, Building2, Linkedin, MessageCircle,
  CreditCard, AlertCircle
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ibmsspLogo from '@/assets/ibmssp-logo.png';

export default function Newsletter() {
  const { members, sendEmail } = useData();
  const { user } = useAuth();
  
  const [subject, setSubject] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('paid_members');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [content, setContent] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) attached`);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const insertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgHtml = `<img src="${event.target.result}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;" />`;
          execCommand('insertHTML', imgHtml);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const filteredMembers = members.filter(m => {
    if (recipientFilter === 'all') return true;
    if (recipientFilter === 'paid_members') {
      return (m.payment_status || '').toLowerCase() === 'paid' && 
             (m.registration_status || '').toLowerCase() === 'approved';
    }
    if (recipientFilter === 'unpaid_members') {
      return (m.payment_status || '').toLowerCase() !== 'paid';
    }
    return m.category === recipientFilter;
  });

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!content.trim() || content === '<br>') {
      toast.error('Newsletter content cannot be empty');
      return;
    }
    if (filteredMembers.length === 0) {
      toast.error('No recipients found for the selected category');
      return;
    }

    setIsSending(true);
    let successCount = 0;
    
    try {
      for (const member of filteredMembers) {
        // In a real app, you'd handle attachments properly. 
        // For this demo/implementation, we send the content as HTML.
        await sendEmail({
          to: member.email,
          recipientName: `${member.first_name} ${member.last_name}`,
          subject: subject,
          html: content,
          text: content.replace(/<[^>]*>/g, ''), // Basic HTML to text fallback
        });
        successCount++;
      }
      
      toast.success(`Newsletter sent successfully to ${successCount} recipients!`);
      // Reset form
      setSubject('');
      setContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setAttachments([]);
    } catch (error: any) {
      toast.error(`Error sending newsletter: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Restore editor content ONLY when switching back from preview to edit mode
  useEffect(() => {
    if (!showPreview && editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, [showPreview]); // Removed content dependency to fix cursor reset / backwards typing

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter Hub</h1>
          <p className="text-muted-foreground mt-1 text-lg">Create and broadcast updates to your community members.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <><Eye className="mr-2 h-4 w-4" /> Edit Mode</> : <><Eye className="mr-2 h-4 w-4" /> Live Preview</>}
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {isSending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Dispatch Newsletter</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Newsletter Composer</CardTitle>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {filteredMembers.length} Recipients
                </Badge>
              </div>
              <CardDescription>Compose your message with rich text and media.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              <div className="space-y-6">
                {/* Header Switcher Logic */}
                {!showPreview && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Subject Line</label>
                      <Input 
                        placeholder="e.g. Monthly Community Update - April 2026" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="text-lg py-6 border-slate-200 focus-visible:ring-primary/20 bg-background/50"
                      />
                    </div>
                    <label className="text-sm font-medium text-slate-700 block">Message Body</label>
                  </div>
                )}

                {/* Main Content Area: Either Editor or Branded Preview */}
                {showPreview ? (
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 sm:p-12 min-h-[600px] overflow-y-auto animate-in fade-in zoom-in-95 duration-500 shadow-inner">
                    <div className="max-w-[600px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                      {/* Branded Header */}
                      <div className="p-8 text-center border-b-[3px] border-[#059669] bg-white">
                        <img src={ibmsspLogo} alt="IBMSSP" className="h-16 mx-auto object-contain" />
                      </div>
                      
                      {/* Email Body */}
                      <div 
                        className="p-10 sm:p-12 prose prose-sm max-w-none prose-headings:font-bold prose-p:text-slate-700 prose-img:rounded-xl min-h-[350px]"
                        dangerouslySetInnerHTML={{ __html: content || '<p class="text-slate-400 italic text-center py-10">No content composed yet...</p>' }}
                      />

                      {/* Branded Footer */}
                      <div className="p-10 bg-[#fcfcfc] border-t border-slate-100 text-center">
                        <div className="flex justify-center gap-6 mb-8">
                          <div className="w-10 h-10 rounded-full bg-[#0077b5]/10 flex items-center justify-center text-[#0077b5] border border-[#0077b5]/20">
                            <Linkedin size={20} />
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-900/10 flex items-center justify-center text-slate-900 border border-slate-900/10">
                            <span className="font-bold text-lg">X</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-[#25d366]/10 flex items-center justify-center text-[#25d366] border border-[#25d366]/20">
                            <MessageCircle size={20} fill="currentColor" />
                          </div>
                        </div>
                        <div className="text-[12px] leading-relaxed text-slate-500 space-y-3 max-w-sm mx-auto">
                          <p className="font-bold text-slate-900">
                            © {new Date().getFullYear()} Institute of Business Management Systems Standards Practitioners (IBMSSP).
                          </p>
                          <p>
                            A body of professionals in the business sustainability environment, registered by the Corporate Affairs Commission.
                          </p>
                          <div className="w-12 h-[1.5px] bg-[#059669]/30 mx-auto my-4"></div>
                          <a href="#" className="text-[#059669] font-bold no-underline hover:underline px-4 py-2 rounded-full bg-[#059669]/5">
                            www.ibmssp.org.ng
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-background overflow-hidden flex flex-col shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/50 border-b border-slate-200">
                      <Button variant="ghost" size="icon" onClick={() => execCommand('bold')} title="Bold" className="hover:bg-white"><Bold size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => execCommand('italic')} title="Italic" className="hover:bg-white"><Italic size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => execCommand('underline')} title="Underline" className="hover:bg-white"><Underline size={16} /></Button>
                      <Separator orientation="vertical" className="h-6 mx-2" />
                      <Button variant="ghost" size="icon" onClick={() => execCommand('insertUnorderedList')} title="Bullet List" className="hover:bg-white"><List size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => execCommand('insertOrderedList')} title="Numbered List" className="hover:bg-white"><ListOrdered size={16} /></Button>
                      <Separator orientation="vertical" className="h-6 mx-2" />
                      <Button variant="ghost" size="icon" onClick={() => execCommand('justifyLeft')} title="Align Left" className="hover:bg-white"><AlignLeft size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => execCommand('justifyCenter')} title="Align Center" className="hover:bg-white"><AlignCenter size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => execCommand('justifyRight')} title="Align Right" className="hover:bg-white"><AlignRight size={16} /></Button>
                      <Separator orientation="vertical" className="h-6 mx-2" />
                      <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} title="Insert Image" className="hover:bg-white"><ImageIcon size={16} /></Button>
                      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={insertImage} />
                    </div>
                    
                    {/* Real-time ContentEditable Editor */}
                    <div 
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorChange}
                      className="p-8 min-h-[450px] outline-none prose prose-sm max-w-none prose-headings:font-bold prose-img:rounded-lg focus:placeholder:opacity-0"
                      placeholder="Start drafting your newsletter message..."
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 bg-muted/10 border-t border-border/50">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full px-4 border-dashed"
                    >
                      <Paperclip className="mr-2 h-4 w-4" /> Attach Files
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      onChange={handleFileUpload} 
                    />
                    <span className="text-xs text-muted-foreground">{attachments.length} file(s) attached</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">Markdown and HTML styling supported.</p>
                </div>
                
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {attachments.map((file, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border bg-background/50">
                        <FileText size={12} className="text-primary" />
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <button onClick={() => removeAttachment(i)} className="ml-1 hover:text-destructive transition-colors">
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recipient Settings</CardTitle>
              <CardDescription>Target your newsletter to specific groups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users size={16} className="text-primary" /> Select Audience
                </label>
                <Select value={recipientFilter} onValueChange={setRecipientFilter}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Choose audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid_members">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-emerald-500" /> Paid Members (Approved)
                      </div>
                    </SelectItem>
                    <SelectItem value="unpaid_members">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-amber-500" /> Unpaid Members
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users size={14} /> All Members
                      </div>
                    </SelectItem>
                    <Separator className="my-1" />
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <School size={14} /> Students
                      </div>
                    </SelectItem>
                    <SelectItem value="graduate">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={14} /> Graduates
                      </div>
                    </SelectItem>
                    <SelectItem value="individual">
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} /> Professionals
                      </div>
                    </SelectItem>
                    <SelectItem value="organization">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} /> Organizations
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audience Statistics</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Selected Group</span>
                  <span className="font-medium capitalize">{recipientFilter.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Emails</span>
                  <span className="font-bold text-primary">{filteredMembers.length}</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${(filteredMembers.length / (members.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary" /> Delivery Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${subject ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                    {subject && <CheckCircle2 size={10} />}
                  </div>
                  <span className={subject ? 'text-foreground' : 'text-muted-foreground'}>Catchy subject line added</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${content.length > 20 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                    {content.length > 20 && <CheckCircle2 size={10} />}
                  </div>
                  <span className={content.length > 20 ? 'text-foreground' : 'text-muted-foreground'}>Rich content composed</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${content.includes('<img') ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                    {content.includes('<img') && <CheckCircle2 size={10} />}
                  </div>
                  <span className={content.includes('<img') ? 'text-foreground' : 'text-muted-foreground'}>Visual media included (optional)</span>
                </li>
              </ul>
              
              <div className="pt-2">
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  By clicking "Dispatch Newsletter", your message will be queued for delivery to all {filteredMembers.length} selected members. Please review your content carefully.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
