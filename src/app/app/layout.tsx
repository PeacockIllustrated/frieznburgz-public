                                </span >
                            </Link >
    <div className="flex items-center gap-4">
        <span className="text-sm text-fb-muted hidden md:inline-block">{user.email}</span>
        <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm">Sign Out</Button>
        </form>
    </div>
                        </div >
                    </header >
    <main className="container px-4 py-8 md:px-6 md:py-12">
        {children}
    </main>
                </div >
            </body >
        </html >
    )
}
