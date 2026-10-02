import json, os, time, math, random, tkinter as tk
from tkinter import messagebox

APP="DanClick EXE"
SAVE=os.path.join(os.getenv("APPDATA") or os.path.expanduser("~"), "DanClick", "save.json")
os.makedirs(os.path.dirname(SAVE), exist_ok=True)

DEFAULT={"coins":0,"clicks":0,"best":0,"power":0,"auto":0,"multi":0,"crit":0,"level":1,"crystals":0,"prestige":0}
try:
    with open(SAVE,"r",encoding="utf-8") as f: data={**DEFAULT,**json.load(f)}
except Exception: data=DEFAULT.copy()

COSTS={"power":25,"auto":100,"multi":500,"crit":750}

def save():
    try:
        with open(SAVE,"w",encoding="utf-8") as f: json.dump(data,f)
    except Exception: pass

def multiplier():
    return (2 ** data["multi"]) * (1 + data["prestige"] * .1)

def click_value():
    return max(1, int((1 + data["power"]) * multiplier()))

def cost(kind):
    return int(COSTS[kind] * (1.7 ** data[kind]))

root=tk.Tk()
root.title(APP)
root.geometry("720x760")
root.minsize(600,650)
root.configure(bg="#101827")

title=tk.Label(root,text="⚡ DanClick",font=("Segoe UI",30,"bold"),fg="white",bg="#101827")
title.pack(pady=(18,0))
sub=tk.Label(root,text="Нативная Windows-версия — без Chrome",font=("Segoe UI",11),fg="#aebbd0",bg="#101827")
sub.pack()

level_var=tk.StringVar()
score_var=tk.StringVar()
stats_var=tk.StringVar()
info_var=tk.StringVar()
combo_var=tk.StringVar(value="")

tk.Label(root,textvariable=level_var,font=("Segoe UI",11),fg="#dbe7f5",bg="#101827").pack(pady=(15,3))
bar=tk.Canvas(root,width=420,height=12,bg="#29364a",highlightthickness=0)
bar.pack()
score=tk.Label(root,textvariable=score_var,font=("Segoe UI",52,"bold"),fg="white",bg="#101827")
score.pack(pady=(12,0))
tk.Label(root,textvariable=info_var,font=("Segoe UI",12),fg="#b9c5d6",bg="#101827").pack()
combo=tk.Label(root,textvariable=combo_var,font=("Segoe UI",12,"bold"),fg="#ffe27a",bg="#101827")
combo.pack(pady=5)

click_btn=tk.Button(root,text="КЛИК!",font=("Segoe UI",25,"bold"),width=9,height=3,bg="#42e695",fg="#092017",activebackground="#67f0aa",relief="flat",cursor="hand2")
click_btn.pack(pady=8)

tk.Label(root,textvariable=stats_var,font=("Segoe UI",11),fg="#dbe7f5",bg="#101827").pack(pady=5)

shop=tk.Frame(root,bg="#182235",padx=12,pady=10)
shop.pack(fill="x",padx=28,pady=12)
tk.Label(shop,text="🛒 Магазин",font=("Segoe UI",16,"bold"),fg="white",bg="#182235").grid(row=0,column=0,columnspan=2,pady=(0,8))

buttons={}
names={"power":"👆 Сила клика","auto":"🤖 Автокликер","multi":"🚀 Множитель","crit":"💥 Критический клик"}
for row,(kind,name) in enumerate(names.items(),1):
    tk.Label(shop,text=name,font=("Segoe UI",10,"bold"),fg="white",bg="#182235",anchor="w").grid(row=row,column=0,sticky="w",pady=4)
    b=tk.Button(shop,font=("Segoe UI",9,"bold"),cursor="hand2")
    b.grid(row=row,column=1,sticky="e",pady=4)
    buttons[kind]=b

shop.columnconfigure(0,weight=1)

bottom=tk.Frame(root,bg="#101827")
bottom.pack(fill="x",padx=28)
prestige_btn=tk.Button(bottom,font=("Segoe UI",10,"bold"),cursor="hand2")
prestige_btn.pack(side="left",padx=4)
reset_btn=tk.Button(bottom,text="♻ Сбросить",font=("Segoe UI",10),cursor="hand2")
reset_btn.pack(side="right",padx=4)

last_click=0.0
combo_count=0

def update():
    global last_click
    lvl=data["clicks"]//100+1
    xp=data["clicks"]%100
    level_var.set(f"Уровень {lvl}  •  {xp} / 100 XP")
    bar.delete("all")
    bar.create_rectangle(0,0,420,12,fill="#29364a",outline="")
    bar.create_rectangle(0,0,420*xp/100,12,fill="#42e695",outline="")
    score_var.set(f"{data['coins']:,}")
    info_var.set(f"💰 {data['coins']:,}    💎 {data['crystals']}    за клик: {click_value()}")
    stats_var.set(f"👆 Кликов: {data['clicks']:,}    🏆 Рекорд: {data['best']:,}    ♻️ Престиж: {data['prestige']}")
    for k,b in buttons.items():
        c=cost(k)
        b.config(text=f"Купить {c} 💰  •  Ур. {data[k]}",state="normal" if data["coins"]>=c else "disabled")
    prestige_btn.config(text="♻ Престиж (100 000 💰)",state="normal" if data["coins"]>=100000 else "disabled")
    root.after(100,update)

def click():
    global last_click,combo_count
    now=time.monotonic()
    combo_count=combo_count+1 if now-last_click<1.2 else 1
    last_click=now
    gain=click_value()
    critical=data["crit"] and random.random()<min(.5,data["crit"]*.05)
    if critical: gain*=5
    data["coins"]+=gain
    data["clicks"]+=1
    data["best"]=max(data["best"],data["clicks"])
    combo_var.set("💥 КРИТИЧЕСКИЙ КЛИК!" if critical else (f"🔥 Комбо x{combo_count}" if combo_count>1 else ""))
    save()

def buy(kind):
    c=cost(kind)
    if data["coins"]>=c:
        data["coins"]-=c
        data[kind]+=1
        save()

def prestige():
    if data["coins"]<100000:return
    gain=max(1,int(math.sqrt(data["coins"]/100000)))
    if not messagebox.askyesno("DanClick","Сделать престиж и получить %d 💎?"%gain): return
    data["crystals"]+=gain
    data["prestige"]+=1
    data.update({"coins":0,"clicks":0,"power":0,"auto":0,"multi":0,"crit":0})
    save()

def reset():
    if messagebox.askyesno("DanClick","Удалить весь прогресс?"):
        data.clear(); data.update(DEFAULT); save()

click_btn.config(command=click)
for k,b in buttons.items(): b.config(command=lambda k=k:buy(k))
prestige_btn.config(command=prestige)
reset_btn.config(command=reset)

def auto_tick():
    if data["auto"]:
        data["coins"]+=data["auto"]*multiplier()
        data["coins"]=int(data["coins"])
        save()
    root.after(1000,auto_tick)

update()
auto_tick()
root.mainloop()
